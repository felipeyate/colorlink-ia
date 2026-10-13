/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ViewState, UserProfile, PaintRequest, SurfaceType, WarehouseInventoryItem, PendingRequestData, OrderItem } from './types';
import { THREAD_STEPS, INITIAL_REQUESTS, PINTUCO_INVENTORY, isPaintProduct } from './data';
import { BrandPanel } from './components/BrandPanel';
import { MobileHeader } from './components/MobileHeader';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { ClientDashboard } from './components/ClientDashboard';
import { PackerDashboard } from './components/PackerDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SuccessView } from './components/SuccessView';
import { TransversalDashboard } from './components/TransversalDashboard';
import { TechnicalCalculator } from './components/TechnicalCalculator';
import { AiAssistantModal } from './components/AiAssistantModal';
import { QualityCertificateModal } from './components/QualityCertificateModal';
import { InvoiceModal } from './components/InvoiceModal';
import { SupabaseModal } from './components/SupabaseModal';
import { PintucoHomePage } from './components/PintucoHomePage';
import { EmailToast } from './components/EmailToast';
import { EmailInboxModal } from './components/EmailInboxModal';
import { initAuth } from './googleAuth';
import {
  sendWelcomeEmail,
  sendOrderCreatedEmail,
  sendOrderPackedEmail,
  sendOrderInTransitEmail,
  sendOrderDeliveredEmail,
  getEmailsForUser,
  getAllEmails,
} from './emailService';
import { syncPaintRequestToSupabase, getSupabaseConfig } from './supabase';
import { Sparkles, Sliders, Layers, User, LogOut, ShieldCheck, Boxes, Truck, Lock, UserPlus, Receipt, Database, Mail, CheckCircle2, Home, ShoppingBag, Bell } from './icons';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(() => getSupabaseConfig().connected);
  
  // Cargar pedidos persistidos o usar iniciales (asegurando que en pedidos de pintura solo haya pintura)
  const [requests, setRequests] = useState<PaintRequest[]>(() => {
    try {
      const saved = localStorage.getItem('colorlink_paint_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const isUnwanted = (txt: string) => {
            const l = (txt || '').toLowerCase();
            return (
              l.includes('sellomax') ||
              l.includes('imprimante') ||
              l.includes('rodillo') ||
              l.includes('brocha') ||
              l.includes('bandeja') ||
              l.includes('cinta') ||
              l.includes('plástico') ||
              l.includes('plastico')
            );
          };

          const cleaned = parsed.map((r: PaintRequest) => {
            if (!r.items && r.orderItemType !== 'material') {
              if (r.packagingDetails?.status === 'empacado_listo') {
                if (r.packagingDetails?.manualItems) {
                  const filtered = r.packagingDetails.manualItems.filter((i) => !isUnwanted(i.description));
                  r.packagingDetails.manualItems = filtered.length > 0 ? filtered : undefined;
                }
                if (r.packagingDetails?.checkedSupplies) {
                  const filtered = r.packagingDetails.checkedSupplies.filter((s) => !isUnwanted(s));
                  r.packagingDetails.checkedSupplies = filtered.length > 0 ? filtered : [
                    `${r.packagingDetails.cuñetesPacked || 1} Cuñete(s) (5 Gal) - ${r.technicalCalculation?.recommendedProduct?.name || 'Pintura Pintuco'}`
                  ];
                }
              }
            }
            return r;
          });

          return cleaned;
        }
      }
    } catch {}
    return INITIAL_REQUESTS;
  });

  // Cargar inventario persistido con imágenes oficiales actualizadas
  const [inventoryList, setInventoryList] = useState<WarehouseInventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('colorlink_pintuco_inventory_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Si existían productos creados manualmente por el admin en la versión previa, combinarlos
      const oldSaved = localStorage.getItem('colorlink_pintuco_inventory');
      if (oldSaved) {
        const oldParsed = JSON.parse(oldSaved);
        if (Array.isArray(oldParsed)) {
          const customAdminProducts = oldParsed.filter((item: any) => !PINTUCO_INVENTORY.some(pi => pi.id === item.id));
          if (customAdminProducts.length > 0) {
            const combined = [...PINTUCO_INVENTORY, ...customAdminProducts];
            localStorage.setItem('colorlink_pintuco_inventory_v3', JSON.stringify(combined));
            return combined;
          }
        }
      }
    } catch {}
    return PINTUCO_INVENTORY;
  });

  // Selección pendiente desde la página de inicio o catálogo
  const [pendingRequestData, setPendingRequestData] = useState<PendingRequestData | null>(() => {
    try {
      const saved = localStorage.getItem('colorlink_pending_request');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const updatePendingRequestData = (data: PendingRequestData | null) => {
    setPendingRequestData(data);
    try {
      if (data) {
        localStorage.setItem('colorlink_pending_request', JSON.stringify(data));
      } else {
        localStorage.removeItem('colorlink_pending_request');
      }
    } catch {}
  };

  const [currentRequest, setCurrentRequest] = useState<PaintRequest>(requests[0] || INITIAL_REQUESTS[0]);
  
  // Modales Flotantes
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isEmailInboxOpen, setIsEmailInboxOpen] = useState(false);
  const [selectedEmailModalId, setSelectedEmailModalId] = useState<string | undefined>(undefined);
  const [certificateReq, setCertificateReq] = useState<PaintRequest | null>(null);
  const [invoiceReq, setInvoiceReq] = useState<PaintRequest | null>(null);

  // Estadísticas del Buzón de Correos en Vivo (Exclusivo para el cliente registrado)
  const [emailStats, setEmailStats] = useState(() => ({
    total: 0,
    unread: 0,
  }));

  React.useEffect(() => {
    const refreshEmailCount = () => {
      // SEGURIDAD & PRIVACIDAD:
      // Si no hay usuario registrado/autenticado, no mostrar conteos de notificaciones de otros
      if (!currentUser || !currentUser.email) {
        setEmailStats({ total: 0, unread: 0 });
        return;
      }
      const list = currentUser.role === 'administrador'
        ? getAllEmails()
        : getEmailsForUser(currentUser.email);

      setEmailStats({
        total: list.length,
        unread: list.filter((e) => !e.read).length,
      });
    };

    refreshEmailCount();
    window.addEventListener('colorlink-email-sent', refreshEmailCount);
    window.addEventListener('colorlink-email-read', refreshEmailCount);
    window.addEventListener('colorlink-email-deleted', refreshEmailCount);

    return () => {
      window.removeEventListener('colorlink-email-sent', refreshEmailCount);
      window.removeEventListener('colorlink-email-read', refreshEmailCount);
      window.removeEventListener('colorlink-email-deleted', refreshEmailCount);
    };
  }, [currentUser]);

  // Estado de Google Account / Gmail API Oficial
  const [googleUser, setGoogleUser] = useState<{
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
  } | null>(null);

  // Inicializar observador de autenticación de Google
  React.useEffect(() => {
    const unsub = initAuth(
      (user) => {
        setGoogleUser({
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Guardar en localStorage cuando cambian los pedidos
  const persistRequests = (updatedList: PaintRequest[]) => {
    try {
      localStorage.setItem('colorlink_paint_requests', JSON.stringify(updatedList));
    } catch (err) {
      console.warn('Error al guardar localmente:', err);
    }
  };

  // Guardar en localStorage cuando cambia el inventario
  const handleUpdateInventory = (updatedInv: WarehouseInventoryItem[]) => {
    setInventoryList(updatedInv);
    try {
      localStorage.setItem('colorlink_pintuco_inventory_v3', JSON.stringify(updatedInv));
      localStorage.setItem('colorlink_pintuco_inventory', JSON.stringify(updatedInv));
    } catch (err) {
      console.warn('Error al guardar inventario:', err);
    }
  };

  // Determinar paso activo para el panel izquierdo (BrandPanel)
  const getCurrentStep = (): number => {
    if (!currentUser) return 1;
    switch (view) {
      case 'login':
      case 'register':
        return 1;
      case 'request':
        if (currentUser.role === 'administrador') return 2;
        if (currentUser.role === 'empacador') return 3;
        if (currentUser.role === 'conductor') return 4;
        return 1;
      case 'success':
        return 5;
      case 'transversal-ecosystem':
        return 3;
      default:
        return 1;
    }
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setView('request');
  };

  const handleRegister = (user: UserProfile) => {
    setCurrentUser(user);
    setView('request');
    // Disparar correo de bienvenida oficial de felicitaciones al cliente
    sendWelcomeEmail(user).catch(console.error);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAiModalOpen(false);
    setIsCalculatorOpen(false);
    setIsEmailInboxOpen(false);
    setCertificateReq(null);
    setInvoiceReq(null);
    setView('login');
  };

  const handleUpdateRequest = (updated: PaintRequest) => {
    const prevReq = requests.find((r) => r.id === updated.id);

    // 1. ¿Pasó a Empacado en bodega CEDI?
    const isNowPacked = updated.packagingDetails?.status === 'empacado_listo';
    const wasPacked = prevReq?.packagingDetails?.status === 'empacado_listo';
    if (isNowPacked && !wasPacked) {
      sendOrderPackedEmail(updated).catch(console.error);
    }

    // 2. ¿Pasó a En transporte / en vehículo de despacho?
    const isNowInTransit = updated.deliveryDetails?.routeStatus === 'en_ruta' || updated.status === 'servicio_despacho';
    const wasInTransit = prevReq?.deliveryDetails?.routeStatus === 'en_ruta' || prevReq?.status === 'servicio_despacho';
    if (isNowInTransit && !wasInTransit) {
      sendOrderInTransitEmail(updated).catch(console.error);
    }

    // 3. ¿Pasó a Entregado en obra / Calidad y garantía emitida?
    const isNowDelivered = updated.deliveryDetails?.routeStatus === 'entregado' || updated.status === 'calidad_garantia';
    const wasDelivered = prevReq?.deliveryDetails?.routeStatus === 'entregado' || prevReq?.status === 'calidad_garantia';
    if (isNowDelivered && !wasDelivered) {
      sendOrderDeliveredEmail(updated).catch(console.error);
    }

    setRequests((prev) => {
      const next = prev.map((req) => (req.id === updated.id ? updated : req));
      persistRequests(next);
      return next;
    });
    if (currentRequest.id === updated.id) {
      setCurrentRequest(updated);
    }
    // Sincronizar en segundo plano con Supabase Cloud (12 tablas)
    syncPaintRequestToSupabase(updated);
  };

  const handleSubmitRequest = (newReq: PaintRequest) => {
    // 1. Guardar la solicitud y asignarla como activa
    setRequests((prev) => {
      const next = [newReq, ...prev];
      persistRequests(next);
      return next;
    });
    setCurrentRequest(newReq);
    setView('request');

    // Disparar correo de nueva orden registrada
    sendOrderCreatedEmail(newReq).catch(console.error);

    // 2. DESCONTAR DEL INVENTARIO EN TIEMPO REAL:
    // Todo lo que pida el cliente se descuenta del inventario (unidades, galones, cuñetes y productos múltiples)
    setInventoryList((prevInv) => {
      interface DeductionTarget {
        sku?: string;
        productName?: string;
        category?: string;
        surfaceType?: SurfaceType;
        warehouseCity?: string;
        presentation?: string;
        isPaint: boolean;
        cuñetes: number;
        galones: number;
        units: number;
      }

      const deductionsList: DeductionTarget[] = [];

      // Si el pedido contiene ítems explícitos (carrito multi-ítem, compra directa del catálogo o adicionales)
      if (newReq.items && newReq.items.length > 0) {
        newReq.items.forEach((it) => {
          const isPaint = it.itemType === 'pintura' || it.presentation === 'cuñete' || it.presentation === 'galon';
          let cuñetes = 0;
          let galones = 0;
          let units = 0;

          if (isPaint) {
            if (it.presentation === 'cuñete') {
              cuñetes = it.quantity || 1;
            } else if (it.presentation === 'galon') {
              galones = it.quantity || 1;
            } else if (it.presentation === 'cuarto') {
              galones = Math.max(1, Math.ceil((it.quantity || 1) / 4));
            } else {
              if (it.quantity >= 5) {
                cuñetes = Math.floor(it.quantity / 5);
                galones = it.quantity % 5;
              } else {
                galones = it.quantity || 1;
              }
            }
          } else {
            // Materiales, herramientas e insumos
            units = it.quantity || 1;
            galones = it.quantity || 1;
          }

          deductionsList.push({
            sku: it.sku,
            productName: it.productName,
            category: it.category,
            warehouseCity: it.warehouseCity || newReq.city,
            presentation: it.presentation,
            isPaint,
            cuñetes,
            galones,
            units,
          });
        });
      } else {
        // Pedido unitario tradicional sin array de items explícito
        if (newReq.orderItemType === 'material') {
          const qty = newReq.materialQuantity || 1;
          deductionsList.push({
            sku: newReq.catalogSku,
            productName: newReq.catalogProductName || 'Material',
            warehouseCity: newReq.city,
            isPaint: false,
            cuñetes: 0,
            galones: qty,
            units: qty,
          });
        } else {
          // Pintura principal
          const cuñetes = newReq.technicalCalculation?.totalCuñetes || 0;
          const galones = newReq.technicalCalculation?.remainderGalons ?? (cuñetes === 0 ? 1 : 0);
          deductionsList.push({
            sku: newReq.catalogSku || newReq.technicalCalculation?.recommendedProduct?.id,
            productName: newReq.catalogProductName || newReq.technicalCalculation?.recommendedProduct?.name,
            surfaceType: newReq.surfaceType,
            warehouseCity: newReq.city,
            isPaint: true,
            cuñetes,
            galones,
            units: 0,
          });

          // Si el cálculo técnico incluyó imprimante / sellador (Sellomax, etc.)
          if (
            (newReq.technicalCalculation?.primerGalons || 0) > 0 &&
            newReq.technicalCalculation?.recommendedPrimerProduct
          ) {
            deductionsList.push({
              sku: newReq.technicalCalculation.recommendedPrimerProduct.id,
              productName: newReq.technicalCalculation.recommendedPrimerProduct.name,
              warehouseCity: newReq.city,
              isPaint: true,
              cuñetes: 0,
              galones: newReq.technicalCalculation.primerGalons || 1,
              units: 0,
            });
          }
        }
      }

      // Mapear deducciones acumuladas por ID de ítem del inventario
      const deductionsByItemId = new Map<
        string,
        { cuñetes: number; galones: number; units: number; isPaint: boolean }
      >();

      deductionsList.forEach((reqItem) => {
        const targetCity = (reqItem.warehouseCity || newReq.city || '').toLowerCase().trim();

        let bestMatch: WarehouseInventoryItem | null = null;
        let highestScore = -1;

        prevInv.forEach((invItem) => {
          let score = 0;
          const invCity = (invItem.warehouseCity || '').toLowerCase().trim();
          const cityMatches = targetCity && (invCity === targetCity || invCity.includes(targetCity) || targetCity.includes(invCity));

          // 1. Coincidencia por SKU / ID
          const skuMatches =
            reqItem.sku &&
            (invItem.sku?.toLowerCase() === reqItem.sku.toLowerCase() ||
              invItem.id?.toLowerCase() === reqItem.sku.toLowerCase() ||
              invItem.productId?.toLowerCase() === reqItem.sku.toLowerCase());

          if (skuMatches) {
            score += 100;
          }

          // 2. Coincidencia por Nombre de Producto
          if (reqItem.productName && invItem.productName) {
            const cleanInvName = invItem.productName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanReqName = reqItem.productName.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cleanInvName === cleanReqName) {
              score += 90;
            } else if (cleanInvName.includes(cleanReqName) || cleanReqName.includes(cleanInvName)) {
              score += 70;
            } else {
              const reqWords = reqItem.productName.toLowerCase().split(' ').filter((w) => w.length > 3);
              const invWords = invItem.productName.toLowerCase().split(' ').filter((w) => w.length > 3);
              const commonWords = reqWords.filter((w) => invWords.includes(w));
              if (commonWords.length > 0) {
                score += 25 * commonWords.length;
              }
            }
          }

          // 3. Coincidencia por superficie / categoría si es formulación libre
          if (reqItem.surfaceType) {
            const cat = invItem.category.toLowerCase();
            if (reqItem.surfaceType === 'fachada_exterior' && (cat.includes('fachada') || cat.includes('exterior') || cat.includes('koraza'))) score += 50;
            if (reqItem.surfaceType === 'concreto_piso' && (cat.includes('industrial') || cat.includes('piso') || cat.includes('epox'))) score += 50;
            if (reqItem.surfaceType === 'metal_ferroso' && (cat.includes('metal') || cat.includes('ferroso') || cat.includes('pintulux'))) score += 50;
            if (reqItem.surfaceType === 'mamposteria_interior' && (cat.includes('arquitectónica') || cat.includes('interior') || cat.includes('viniltex'))) score += 50;
            if (reqItem.surfaceType === 'madera' && (cat.includes('madera') || cat.includes('barniz') || cat.includes('deck'))) score += 50;
            if (reqItem.surfaceType === 'humedad_salitre' && (cat.includes('preparación') || cat.includes('humedad') || cat.includes('sellomax'))) score += 50;
          }

          // Bonus por Bodega / Ciudad
          if (cityMatches) {
            score += 25;
          }

          // Bonus si el ítem tiene existencias
          const hasStock = (invItem.cuñetesAvailable || 0) > 0 || (invItem.galonesAvailable || 0) > 0 || (invItem.unitsAvailable ?? 0) > 0;
          if (hasStock) {
            score += 10;
          }

          if (score > highestScore && score >= 35) {
            highestScore = score;
            bestMatch = invItem;
          }
        });

        // Registrar la deducción acumulada en el ítem seleccionado
        if (bestMatch) {
          const current = deductionsByItemId.get(bestMatch.id) || {
            cuñetes: 0,
            galones: 0,
            units: 0,
            isPaint: reqItem.isPaint,
          };
          current.cuñetes += reqItem.cuñetes;
          current.galones += reqItem.galones;
          current.units += reqItem.units;
          current.isPaint = reqItem.isPaint || isPaintProduct(bestMatch);
          deductionsByItemId.set(bestMatch.id, current);
        }
      });

      // Si no se encontraron coincidencias, retornar sin cambios
      if (deductionsByItemId.size === 0) {
        return prevInv;
      }

      // Aplicar las deducciones de forma estricta a cada ítem afectado
      const updatedInv = prevInv.map((item) => {
        const deduction = deductionsByItemId.get(item.id);
        if (!deduction) return item;

        const isItemPaint = deduction.isPaint || isPaintProduct(item);

        let newCuñetes = item.cuñetesAvailable ?? 0;
        let newGalones = item.galonesAvailable ?? 0;
        let newUnits = item.unitsAvailable !== undefined ? item.unitsAvailable : (item.galonesAvailable ?? 0);

        if (isItemPaint) {
          newCuñetes = Math.max(0, newCuñetes - deduction.cuñetes);
          newGalones = Math.max(0, newGalones - deduction.galones);
          if (item.unitsAvailable !== undefined) {
            newUnits = (newCuñetes * 5) + newGalones;
          }
        } else {
          const qtyToDeduct = deduction.units || deduction.galones || 1;
          newUnits = Math.max(0, newUnits - qtyToDeduct);
          newGalones = newUnits;
        }

        const totalUnitsLeft = isItemPaint
          ? (newCuñetes * 5) + newGalones
          : newUnits;

        let newStatus: 'optimo' | 'alerta_reposicion' | 'critico' | 'agotado' = 'optimo';
        if (totalUnitsLeft <= 0) {
          newStatus = 'agotado';
        } else if (totalUnitsLeft <= item.minStockAlert) {
          newStatus = 'critico';
        } else if (totalUnitsLeft <= item.minStockAlert * 1.5) {
          newStatus = 'alerta_reposicion';
        } else {
          newStatus = 'optimo';
        }

        const newTotalLiters = isItemPaint
          ? Math.max(0, Math.round(newCuñetes * 18.925 + newGalones * 3.785))
          : Math.max(0, (item.totalLiters || 0) - (deduction.units || 1));

        return {
          ...item,
          cuñetesAvailable: newCuñetes,
          galonesAvailable: newGalones,
          unitsAvailable: newUnits,
          totalLiters: newTotalLiters,
          status: newStatus,
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      });

      // Guardar en localStorage de forma sincronizada
      try {
        localStorage.setItem('colorlink_pintuco_inventory_v3', JSON.stringify(updatedInv));
        localStorage.setItem('colorlink_pintuco_inventory', JSON.stringify(updatedInv));
        window.dispatchEvent(new CustomEvent('inventory-updated', { detail: updatedInv }));
      } catch (err) {
        console.warn('Error al guardar inventario:', err);
      }

      return updatedInv;
    });

    // 3. Limpiar selección pendiente
    updatePendingRequestData(null);

    // 4. Sincronizar en segundo plano con Supabase Cloud (12 tablas)
    syncPaintRequestToSupabase(newReq);
  };

  const handleApplyCalculationToRequest = (surface: SurfaceType, areaM2: number) => {
    setIsCalculatorOpen(false);
    updatePendingRequestData({ surfaceType: surface, areaM2 });
    if (currentUser) {
      setView('request');
    } else {
      setView('register');
    }
  };

  // Guard de seguridad: Sólo el Administrador puede ingresar al Ecosistema 360°
  // Para cliente, empacador y conductores, se redirige inmediatamente a su portal
  useEffect(() => {
    if (currentUser && currentUser.role !== 'administrador' && view === 'transversal-ecosystem') {
      setView('request');
    }
  }, [currentUser, view]);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'administrador':
        return { label: 'Administrador General', icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />, bg: 'bg-blue-100/80 text-blue-950 border-blue-300 font-bold' };
      case 'empacador':
        return { label: 'Bodega & Empaque', icon: <Boxes className="w-3.5 h-3.5 text-sky-700" />, bg: 'bg-sky-100/80 text-sky-950 border-sky-300 font-bold' };
      case 'conductor':
        return { label: 'Conductor Logístico', icon: <Truck className="w-3.5 h-3.5 text-indigo-700" />, bg: 'bg-indigo-100/80 text-indigo-950 border-indigo-300 font-bold' };
      default:
        return { label: 'Cliente ColorLink', icon: <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />, bg: 'bg-blue-50 text-blue-900 border-blue-200 font-bold' };
    }
  };

  const roleBadge = getRoleBadge(currentUser?.role);

  return (
    <div className="app-root" id="colorlink-root-app">
      {/* Si la vista es 'home', renderizamos la página oficial estilo Pintuco */}
      {view === 'home' ? (
        <PintucoHomePage
          currentUser={currentUser}
          requests={requests}
          inventory={inventoryList}
          onNavigateToLogin={() => setView('login')}
          onNavigateToRegister={() => setView('register')}
          onNavigateToPortal={() => {
            if (currentUser) {
              setView('request');
            } else {
              setView('login');
            }
          }}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenAiAssistant={() => setIsAiModalOpen(true)}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onOpenEmailInbox={() => {
            setSelectedEmailModalId(undefined);
            setIsEmailInboxOpen(true);
          }}
          onLogout={handleLogout}
          onSelectColorAndQuote={(colorName, colorHex) => {
            updatePendingRequestData({
              colorName,
              colorHex,
            });
            if (currentUser) {
              setView('request');
            } else {
              setView('register');
            }
          }}
          onSelectRoomAndQuote={(surface, productName, colorTag) => {
            updatePendingRequestData({
              surfaceType: surface,
              productName,
              colorName: colorTag.split('&')[0].trim(),
            });
            if (currentUser) {
              setView('request');
            } else {
              setView('register');
            }
          }}
          onSelectCalculationAndQuote={(surface, areaM2, productName) => {
            updatePendingRequestData({
              surfaceType: surface,
              areaM2,
              productName,
            });
            if (currentUser) {
              setView('request');
            } else {
              setView('register');
            }
          }}
          onSelectCatalogItemAndBuy={(item, options) => {
            updatePendingRequestData({
              catalogItem: item,
              orderItemType: item.unitType === 'herramienta' || item.unitType === 'insumo' ? 'material' : 'pintura',
              colorName: options?.colorName,
              colorHex: options?.colorHex,
              materialQuantity: options?.quantity || 1,
            });
            if (currentUser) {
              setView('request');
            } else {
              setView('register');
            }
          }}
          onSelectSpaceAndQuote={(space) => {
            const matchingItem = inventoryList.find((item) =>
              item.productName.toLowerCase().includes(space.productName.toLowerCase().split(' ')[0]) ||
              (space.surface === 'fachada_exterior' && item.category.toLowerCase().includes('fachada')) ||
              (space.surface === 'concreto_piso' && item.category.toLowerCase().includes('industrial')) ||
              (space.surface === 'mamposteria_interior' && item.category.toLowerCase().includes('arquitectónica'))
            );

            updatePendingRequestData({
              surfaceType: space.surface,
              productName: space.productName,
              colorName: space.colorName,
              colorHex: space.colorHex,
              roomTitle: space.title,
              areaM2: space.areaM2 || 65,
              finish: space.finish,
              orderItemType: 'pintura',
              catalogItem: matchingItem,
              notes: `Formulado desde espacio real: ${space.title}. Producto recomendado: ${space.productName} (${space.finish || 'Estándar'}) en color ${space.colorName} (${space.colorHex}).`,
            });
            if (currentUser) {
              setView('request');
            } else {
              setView('register');
            }
          }}
        />
      ) : (
        <>
          {/* Barra de navegación superior ColorLink · Paleta Armoniosa Blancos y Azules */}
          <header className="navbar-root shadow-xs sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100">
            {/* Franja superior Azul Real & Celeste Vibrante */}
            <div className="h-[2.5px] w-full bg-gradient-to-r from-blue-700 via-sky-500 to-indigo-600" />

            <div className="navbar-container !max-w-full !px-3 sm:!px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Logo ColorLink Oficial con Emblema CL */}
                <button
                  type="button"
                  className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group text-left transition-transform hover:scale-[1.01]"
                  onClick={() => setView('home')}
                  id="btn-nav-brand-logo"
                  title="ColorLink · Inicio"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/40 shadow-xs flex items-center justify-center font-bold text-white text-sm font-['Space_Grotesk'] tracking-wide group-hover:rotate-[-3deg] transition-transform shrink-0">
                    CL
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="font-bold text-lg text-slate-900 tracking-tight font-['Space_Grotesk']">ColorLink</span>
                    </div>
                    <span className="text-[9px] font-mono tracking-wider uppercase text-blue-600/80 font-semibold mt-0.5 hidden xs:inline">
                      Gestión Inteligente de Recubrimientos
                    </span>
                  </div>
                </button>

                <div className="h-5 w-px bg-slate-200 hidden sm:block" />

                {/* Botón Catálogo / Inicio */}
                <button
                  type="button"
                  onClick={() => setView('home')}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-blue-50/80 text-slate-700 hover:text-blue-700 font-semibold text-xs border border-slate-200 hover:border-blue-300 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  title="Volver al Catálogo y Vista Principal"
                  id="btn-nav-goto-pintuco-home"
                >
                  <Home className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Catálogo & Inicio</span>
                </button>

                {/* Menú de acceso cuando está autenticado */}
                {currentUser && (
                  <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-slate-200">
                    <button
                      type="button"
                      onClick={() => setView('request')}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        view === 'request' || view === 'success'
                          ? 'bg-blue-600 text-white font-bold shadow-xs border border-blue-700'
                          : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      {roleBadge.icon}
                      <span className="hidden sm:inline">
                        {currentUser.role === 'cliente'
                          ? 'Mi Portal Cliente'
                          : currentUser.role === 'empacador'
                          ? 'Centro de Empaque'
                          : currentUser.role === 'conductor'
                          ? 'Rutas y Envíos'
                          : 'Panel Admin'}
                      </span>
                      <span className="sm:hidden">Portal</span>
                    </button>

                    {/* SOLO visible para ADMINISTRADOR: El cliente, empacador y conductores NO ven Ecosistema 360° en su barra */}
                    {currentUser.role === 'administrador' && (
                      <button
                        type="button"
                        onClick={() => setView('transversal-ecosystem')}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          view === 'transversal-ecosystem'
                            ? 'bg-blue-950 text-white font-bold shadow-xs'
                            : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                        title="Ecosistema Transversal 360° (Exclusivo Administrador)"
                        id="btn-nav-ecosistema-admin"
                      >
                        <Layers className="w-3.5 h-3.5 text-sky-400" />
                        <span>Ecosistema 360°</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Lado Derecho: Acciones Amigables con el Cliente */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Notificaciones y Despachos: SOLO para el cliente que esté registrado (o admin) */}
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmailModalId(undefined);
                      setIsEmailInboxOpen(true);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                      emailStats.unread > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold border border-blue-700 animate-pulse'
                        : 'bg-white hover:bg-blue-50/80 text-slate-700 hover:text-blue-700 border border-slate-200'
                    }`}
                    title={
                      currentUser.role === 'cliente'
                        ? `Tus notificaciones personales (${currentUser.email})`
                        : 'Buzón de notificaciones del sistema'
                    }
                    id="btn-header-email-inbox"
                  >
                    <Bell className={`w-3.5 h-3.5 ${emailStats.unread > 0 ? 'text-white' : 'text-blue-600'}`} />
                    <span className="hidden md:inline">
                      {currentUser.role === 'cliente' ? 'Mis Notificaciones' : 'Notificaciones'}
                    </span>
                    {emailStats.unread > 0 ? (
                      <span className="px-1.5 py-0.2 rounded-full bg-white text-blue-700 font-bold font-mono text-[10px]">
                        {emailStats.unread}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({emailStats.total})
                      </span>
                    )}
                  </button>
                )}

                {/* Acceso a Supabase Cloud: visible solo para Administrador */}
                {currentUser?.role === 'administrador' && (
                  <button
                    type="button"
                    onClick={() => setIsSupabaseModalOpen(true)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                      supabaseConnected
                        ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300'
                    }`}
                    title="Configurar y sincronizar Base de Datos Supabase (PostgreSQL)"
                    id="btn-header-supabase-db"
                  >
                    <Database className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden xl:inline">Supabase DB</span>
                    {supabaseConnected ? (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                    )}
                  </button>
                )}

                {/* Calculadora de Pintura */}
                <button
                  type="button"
                  onClick={() => setIsCalculatorOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50/80 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  title="Calcular metros cuadrados y galones para tus muros"
                  id="btn-nav-calculator"
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden lg:inline">Calculadora m²</span>
                </button>

                {/* Asesor IA ColorLink */}
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold rounded-full text-xs flex items-center gap-1.5 transition-all shadow-xs border border-blue-500 cursor-pointer"
                  title="Consultar recomendaciones con el Asesor Técnico Inteligente"
                  id="btn-nav-ai-assistant"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Asesor IA</span>
                </button>

                {/* Perfil de Usuario o Botones de Login */}
                {currentUser ? (
                  <div className="flex items-center gap-1.5 sm:gap-2 ml-1 pl-1.5 sm:pl-2 border-l border-slate-200">
                    <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-200/80 rounded-full pl-1.5 pr-2.5 py-1">
                      <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-300 shadow-2xs shrink-0">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="hidden sm:flex flex-col text-left leading-tight">
                        <span className="text-xs font-bold text-blue-950 truncate max-w-[110px]" title={currentUser.name}>
                          {currentUser.name.split(' ')[0]}
                        </span>
                        <span className="text-[9.5px] font-semibold text-blue-600">
                          {currentUser.role === 'cliente'
                            ? 'Cliente ColorLink'
                            : currentUser.role === 'empacador'
                            ? 'Empacador CEDI'
                            : currentUser.role === 'conductor'
                            ? 'Conductor Logístico'
                            : 'Administrador'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer border border-slate-200"
                      title="Cerrar sesión"
                      id="btn-nav-logout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 transition-all cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                      <span>Iniciar Sesión</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('register')}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 shadow-xs transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 inline mr-1 text-white" />
                      <span>Cotizar Proyecto</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Renderizado de la Vista Principal */}
          {currentUser && view === 'transversal-ecosystem' ? (
            <main className="min-h-[calc(100vh-65px)] bg-[#f8fafc] p-4 md:p-6">
              <TransversalDashboard
                requests={requests}
                onSelectRequest={(r) => {
                  setCurrentRequest(r);
                }}
                onCreateNewRequest={() => {
                  setView('request');
                }}
                onOpenCalculator={() => setIsCalculatorOpen(true)}
                onOpenAiAssistant={() => setIsAiModalOpen(true)}
                onOpenCertificate={(r) => setCertificateReq(r)}
              />
            </main>
          ) : currentUser && view === 'success' ? (
            <main className="min-h-[calc(100vh-45px)] w-full bg-[#f8fafc] p-3 sm:p-4 md:p-6" id="main-portal-content">
              <div className="max-w-4xl mx-auto py-6">
                <SuccessView
                  request={currentRequest}
                  onNewRequest={() => setView('request')}
                  onViewTransversal={() => setView('transversal-ecosystem')}
                  onOpenCertificateModal={() => setCertificateReq(currentRequest)}
                  onOpenInvoiceModal={() => setInvoiceReq(currentRequest)}
                  onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                />
              </div>
            </main>
          ) : !currentUser ? (
            /* VISTAS NO AUTENTICADAS: Experiencia limpia, moderna en blanco y azul */
            <div className="min-h-[calc(100vh-65px)] bg-[#f8fafc] flex flex-col items-center justify-center p-4 sm:p-6 py-8 relative" id="main-auth-container">
              {/* Selector de modo estilo segmented pill */}
              <div className="mb-4 inline-flex items-center p-1 bg-white border border-blue-200/80 rounded-xl text-xs font-semibold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    view !== 'register'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-blue-700'
                  }`}
                  id="tab-btn-auth-login"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    view === 'register'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-blue-700'
                  }`}
                  id="tab-btn-auth-register"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Crear Cuenta de Cliente</span>
                </button>
              </div>

              {view === 'register' ? (
                <RegisterView
                  onRegister={handleRegister}
                  onNavigateToLogin={() => setView('login')}
                  onNavigateToHome={() => setView('home')}
                  pendingRequestData={pendingRequestData}
                />
              ) : (
                <LoginView
                  onLogin={handleLogin}
                  onNavigateToRegister={() => setView('register')}
                  onNavigateToHome={() => setView('home')}
                />
              )}
            </div>
          ) : (
            /* USUARIO AUTENTICADO (ADMINISTRADOR, EMPACADOR, CONDUCTOR, CLIENTE):
               Pantalla completa y despejada sin BrandPanel lateral */
            <main className="min-h-[calc(100vh-45px)] w-full bg-[#f8fafc] p-3 sm:p-4 md:p-6 flex flex-col items-center" id="main-portal-content">
              {currentUser.role === 'administrador' ? (
                <AdminDashboard
                  currentUser={currentUser}
                  requests={requests}
                  inventoryList={inventoryList}
                  onUpdateInventory={handleUpdateInventory}
                  onUpdateRequest={handleUpdateRequest}
                  onCreateNewRequest={() => {
                    setIsCalculatorOpen(true);
                  }}
                  onOpenCalculator={() => setIsCalculatorOpen(true)}
                  onOpenAiAssistant={() => setIsAiModalOpen(true)}
                  onOpenCertificate={(req) => setCertificateReq(req)}
                />
              ) : currentUser.role === 'empacador' ? (
                <PackerDashboard
                  currentUser={currentUser}
                  requests={requests}
                  onUpdateRequest={handleUpdateRequest}
                  onOpenCalculator={() => setIsCalculatorOpen(true)}
                />
              ) : currentUser.role === 'conductor' ? (
                <DriverDashboard
                  currentUser={currentUser}
                  requests={requests}
                  onUpdateRequest={handleUpdateRequest}
                  onOpenCertificate={(req) => setCertificateReq(req)}
                />
              ) : (
                <ClientDashboard
                  currentUser={currentUser}
                  requests={requests}
                  inventoryList={inventoryList}
                  initialPendingData={pendingRequestData}
                  onClearInitialPendingData={() => updatePendingRequestData(null)}
                  onSubmitRequest={handleSubmitRequest}
                  onUpdateRequest={handleUpdateRequest}
                  onOpenEmailInbox={(emailId) => {
                    setSelectedEmailModalId(emailId);
                    setIsEmailInboxOpen(true);
                  }}
                  onOpenAiAssistant={() => setIsAiModalOpen(true)}
                  onOpenCalculator={() => setIsCalculatorOpen(true)}
                  onOpenCertificate={(req) => setCertificateReq(req)}
                  onLogout={handleLogout}
                  onViewTransversal={() => setView('transversal-ecosystem')}
                />
              )}
            </main>
          )}
        </>
      )}

      {/* Modales Flotantes - Disponibles tanto en la Home como en el Portal */}
      {isAiModalOpen && (
        <AiAssistantModal
          onClose={() => setIsAiModalOpen(false)}
        />
      )}

      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <TechnicalCalculator
            onClose={() => setIsCalculatorOpen(false)}
            onApplyCalculationToRequest={(surface, areaM2) => {
              if (!currentUser) {
                setIsCalculatorOpen(false);
                setView('register');
              } else {
                handleApplyCalculationToRequest(surface, areaM2);
              }
            }}
          />
        </div>
      )}

      {currentUser && certificateReq && (
        <QualityCertificateModal
          request={certificateReq}
          onClose={() => setCertificateReq(null)}
        />
      )}

      {currentUser && invoiceReq && (
        <InvoiceModal
          request={invoiceReq}
          onClose={() => setInvoiceReq(null)}
        />
      )}

      {/* Modal de Conexión y Sincronización con Supabase Cloud */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => {
          setIsSupabaseModalOpen(false);
          setSupabaseConnected(getSupabaseConfig().connected);
        }}
        requests={requests}
        onSyncComplete={() => {
          setSupabaseConnected(getSupabaseConfig().connected);
        }}
      />

      {/* Toast Flotante de Correos Enviados en Tiempo Real (Exclusivo para el cliente registrado) */}
      <EmailToast
        currentUser={currentUser}
        onOpenEmail={(email) => {
          setSelectedEmailModalId(email.id);
          setIsEmailInboxOpen(true);
        }}
      />

      {/* Modal Oficial de Buzón de Correos Electrónicos */}
      {isEmailInboxOpen && (
        <EmailInboxModal
          currentUser={currentUser}
          onClose={() => setIsEmailInboxOpen(false)}
          initialSelectedEmailId={selectedEmailModalId}
        />
      )}
    </div>
  );
};
