import React, { useState, useMemo, useEffect } from 'react';
import { Field } from './Field';
import { PaintRequest, SurfaceType, EnvironmentType, UserProfile, WarehouseInventoryItem, PendingRequestData, OrderItem } from '../types';
import { calculatePintucoSystem, PINTUCO_WAREHOUSES, checkInventoryStock, isPaintProduct, getProductImage } from '../data';
import {
  Paintbrush,
  Layers,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Package,
  Clock,
  Droplet,
  LogOut,
  Building,
  Boxes,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Check,
  Ban,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
} from '../icons';

interface RequestViewProps {
  currentUser: UserProfile;
  inventoryList?: WarehouseInventoryItem[];
  selectedCatalogItem?: WarehouseInventoryItem | null;
  initialPendingData?: PendingRequestData | null;
  onClearSelectedCatalogItem?: () => void;
  onSubmitRequest: (request: PaintRequest) => void;
  onOpenAiAssistant: () => void;
  onLogout: () => void;
  onViewTransversal: () => void;
}

export const RequestView: React.FC<RequestViewProps> = ({
  currentUser,
  inventoryList = [],
  selectedCatalogItem,
  initialPendingData,
  onClearSelectedCatalogItem,
  onSubmitRequest,
  onOpenAiAssistant,
  onLogout,
  onViewTransversal,
}) => {
  // Determinar si el producto seleccionado es Pintura o Material / Herramienta
  const isPaint = useMemo(() => {
    return isPaintProduct(selectedCatalogItem || undefined);
  }, [selectedCatalogItem]);

  const [projectType, setProjectType] = useState<'Residencial' | 'Comercial' | 'Industrial' | 'Institucional'>('Residencial');
  const [surfaceType, setSurfaceType] = useState<SurfaceType>(() => {
    if (initialPendingData?.surfaceType) return initialPendingData.surfaceType;
    return 'mamposteria_interior';
  });
  const [environment, setEnvironment] = useState<EnvironmentType>('interior');
  const [areaM2, setAreaM2] = useState<number>(() => {
    if (initialPendingData?.areaM2) return initialPendingData.areaM2;
    return 120;
  });

  // Color de pintura (solo para productos de tipo pintura)
  const [colorName, setColorName] = useState(() => {
    if (initialPendingData?.colorName) return initialPendingData.colorName;
    return 'Blanco Lirio Silvestre 01';
  });
  const [customColorHex, setCustomColorHex] = useState(() => {
    if (initialPendingData?.colorHex) return initialPendingData.colorHex;
    return '#86DEB8';
  });
  const [isCustomColorActive, setIsCustomColorActive] = useState(false);
  const [finishType, setFinishType] = useState<'Mate' | 'Satinado' | 'Semibrillante' | 'Brillante'>(() => {
    if (initialPendingData?.finish) {
      const f = initialPendingData.finish.toLowerCase();
      if (f.includes('satin')) return 'Satinado';
      if (f.includes('brillant')) return 'Brillante';
      if (f.includes('semi')) return 'Semibrillante';
      return 'Mate';
    }
    return 'Mate';
  });

  // Cantidad de material (solo para productos de tipo material/herramienta)
  const [materialQuantity, setMaterialQuantity] = useState<number>(() => {
    if (initialPendingData?.materialQuantity) return initialPendingData.materialQuantity;
    return 1;
  });

  const [city, setCity] = useState(currentUser.city || 'Medellín');
  const [deliveryAddress, setDeliveryAddress] = useState(
    currentUser.city ? `Calle 45 # 22-80, ${currentUser.city}` : `${city}, Colombia`
  );
  const [notes, setNotes] = useState(() => {
    if (initialPendingData?.notes) return initialPendingData.notes;
    if (initialPendingData?.roomTitle) {
      return `Formulación para espacio: ${initialPendingData.roomTitle}. Producto sugerido: ${initialPendingData.productName || 'Línea Pintuco de alto desempeño'}.`;
    }
    return '';
  });
  const [requiresApplicationService, setRequiresApplicationService] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockError, setStockError] = useState('');

  // Ítems adicionales en el mismo pedido
  const [extraItems, setExtraItems] = useState<OrderItem[]>([]);
  const [showAddExtraModal, setShowAddExtraModal] = useState<boolean>(false);
  const [selectedExtraProduct, setSelectedExtraProduct] = useState<WarehouseInventoryItem | null>(null);
  const [extraQty, setExtraQty] = useState<number>(1);
  const [extraFormat, setExtraFormat] = useState<'galon' | 'cuñete' | 'unidad'>('unidad');
  const [extraColor, setExtraColor] = useState<{ name: string; hex: string }>({
    name: 'Blanco Lirio Silvestre 01',
    hex: '#F1F5F9',
  });

  const handleAddExtraItem = () => {
    if (!selectedExtraProduct) return;
    const isPaintProd = isPaintProduct(selectedExtraProduct);
    let unitPrice = selectedExtraProduct.unitPrice || selectedExtraProduct.pricePerGalon || (isPaintProd ? 115000 : 28000);
    if (isPaintProd && extraFormat === 'cuñete') {
      unitPrice = Math.round(unitPrice * 5 * 0.92);
    }
    const totalCost = unitPrice * extraQty;

    const newItem: OrderItem = {
      id: `extra-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sku: selectedExtraProduct.sku,
      productName: selectedExtraProduct.productName,
      category: selectedExtraProduct.category,
      itemType: isPaintProd ? 'pintura' : 'material',
      colorName: isPaintProd ? extraColor.name : undefined,
      colorHex: isPaintProd ? extraColor.hex : undefined,
      presentation: isPaintProd ? extraFormat : 'unidad',
      quantity: extraQty,
      unitPrice,
      totalCostCOP: totalCost,
      warehouseCity: selectedExtraProduct.warehouseCity,
      warehouseName: selectedExtraProduct.warehouseName,
      notes: isPaintProd ? `Pintura adicional (${extraFormat})` : 'Herramienta / Insumo adicional',
    };

    setExtraItems((prev) => [...prev, newItem]);
    setShowAddExtraModal(false);
    setSelectedExtraProduct(null);
    setExtraQty(1);
  };

  // Sincronizar superficie y bodega cuando el cliente selecciona un producto del catálogo
  useEffect(() => {
    if (selectedCatalogItem) {
      const pName = selectedCatalogItem.productName.toLowerCase();
      const cat = (selectedCatalogItem.category || '').toLowerCase();
      if (pName.includes('koraza') || cat.includes('fachada')) {
        setSurfaceType('fachada_exterior');
        setEnvironment('exterior');
      } else if (pName.includes('epox') || pName.includes('pintucoat') || cat.includes('industrial') || cat.includes('piso')) {
        setSurfaceType('concreto_piso');
        setEnvironment('industrial');
      } else if (pName.includes('pintulux') || cat.includes('metal')) {
        setSurfaceType('metal_ferroso');
        setEnvironment('exterior');
      } else if (pName.includes('mader') || cat.includes('madera')) {
        setSurfaceType('madera');
        setEnvironment('interior');
      } else if (pName.includes('sellomax') || pName.includes('salitre') || cat.includes('fondo') || cat.includes('preparacion')) {
        setSurfaceType('humedad_salitre');
        setEnvironment('interior');
      }

      if (selectedCatalogItem.warehouseCity) {
        setCity(selectedCatalogItem.warehouseCity);
      }

      if (selectedCatalogItem.availableColors && selectedCatalogItem.availableColors.length > 0) {
        setColorName(selectedCatalogItem.availableColors[0].name);
        setCustomColorHex(selectedCatalogItem.availableColors[0].hex);
        setIsCustomColorActive(false);
      }
      if (selectedCatalogItem.finish) {
        setFinishType(selectedCatalogItem.finish as any);
      }
    }
  }, [selectedCatalogItem]);

  // Cálculo técnico para pinturas
  const calculation = useMemo(() => {
    const baseCalc = calculatePintucoSystem(surfaceType, areaM2, environment);
    if (selectedCatalogItem && isPaint) {
      const itemPrice = selectedCatalogItem.pricePerGalon || baseCalc.recommendedProduct.pricePerGalon;
      const paintCost = (baseCalc.totalCuñetes * (itemPrice * 5 * 0.92)) + (baseCalc.remainderGalons * itemPrice);
      const primerCost = baseCalc.recommendedPrimerProduct ? (baseCalc.primerGalons * 68000) : 0;
      return {
        ...baseCalc,
        recommendedProduct: {
          ...baseCalc.recommendedProduct,
          name: selectedCatalogItem.productName,
          pricePerGalon: itemPrice,
          finishType,
        },
        estimatedMaterialCostCOP: Math.round(paintCost + primerCost),
      };
    }
    return baseCalc;
  }, [surfaceType, areaM2, environment, selectedCatalogItem, isPaint, finishType]);

  const nearestWarehouse = useMemo(() => {
    return PINTUCO_WAREHOUSES.find(w => w.city.toLowerCase().includes(city.toLowerCase())) || PINTUCO_WAREHOUSES[0];
  }, [city]);

  // Verificación de disponibilidad de stock
  const currentStockStatus = useMemo(() => {
    if (selectedCatalogItem) {
      if (!isPaint) {
        // Para herramientas o insumos, el stock está en galonesAvailable o totalLiters
        const unitsAvailable = selectedCatalogItem.galonesAvailable || selectedCatalogItem.totalLiters || 0;
        const isAvail = unitsAvailable > 0 && selectedCatalogItem.status !== 'agotado';
        return {
          isAvailable: isAvail,
          totalCuñetes: 0,
          totalGalones: unitsAvailable,
          warehouseName: selectedCatalogItem.warehouseName,
          warehouseCity: selectedCatalogItem.warehouseCity,
          item: selectedCatalogItem,
        };
      }
      return {
        isAvailable: (selectedCatalogItem.cuñetesAvailable > 0 || selectedCatalogItem.galonesAvailable > 0) && selectedCatalogItem.status !== 'agotado',
        totalCuñetes: selectedCatalogItem.cuñetesAvailable,
        totalGalones: selectedCatalogItem.galonesAvailable,
        warehouseName: selectedCatalogItem.warehouseName,
        warehouseCity: selectedCatalogItem.warehouseCity,
        item: selectedCatalogItem,
      };
    }
    return checkInventoryStock(surfaceType, inventoryList, city);
  }, [surfaceType, inventoryList, city, selectedCatalogItem, isPaint]);

  // Costo total según el tipo de orden
  const totalCostCOP = useMemo(() => {
    if (!isPaint && selectedCatalogItem) {
      return (selectedCatalogItem.pricePerGalon || 28000) * materialQuantity;
    }
    return calculation.estimatedMaterialCostCOP || 0;
  }, [isPaint, selectedCatalogItem, materialQuantity, calculation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentStockStatus.isAvailable) {
      setStockError('No es posible generar la orden: El producto seleccionado se encuentra agotado o sin existencias en bodega CEDI. El Administrador debe reabastecer el inventario.');
      return;
    }

    if (!isPaint && selectedCatalogItem) {
      const unitsAvail = selectedCatalogItem.unitsAvailable ?? selectedCatalogItem.galonesAvailable ?? selectedCatalogItem.totalLiters ?? 0;
      if (materialQuantity > unitsAvail) {
        setStockError(`La cantidad solicitada (${materialQuantity} unidades) supera las existencias disponibles en bodega (${unitsAvail} unidades).`);
        return;
      }
    }

    setStockError('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const codeNumber = Math.floor(1000 + Math.random() * 9000);
      const chosenProdName = selectedCatalogItem ? selectedCatalogItem.productName : calculation.recommendedProduct.name;
      const finalColor = isPaint
        ? (isCustomColorActive ? `Personalizado (${customColorHex})` : colorName)
        : 'N/A (Material / Herramienta)';

      const primaryItem: OrderItem = {
        id: `item-${Date.now()}-primary`,
        sku: selectedCatalogItem?.sku || (isPaint ? calculation.recommendedProduct.id : 'PTC-MAT-01'),
        productName: chosenProdName,
        category: selectedCatalogItem?.category || (isPaint ? 'Arquitectónica' : 'Material'),
        itemType: isPaint ? 'pintura' : 'material',
        colorName: isPaint ? finalColor : undefined,
        colorHex: isPaint ? (isCustomColorActive ? customColorHex : colorPresets.find(c => c.name === colorName)?.hex || '#86DEB8') : undefined,
        presentation: isPaint ? ((calculation.totalCuñetes || 0) > 0 ? 'cuñete' : 'galon') : 'unidad',
        quantity: isPaint ? ((calculation.totalCuñetes || 0) > 0 ? calculation.totalCuñetes : (calculation.totalGalons || 1)) : materialQuantity,
        unitPrice: selectedCatalogItem?.unitPrice || selectedCatalogItem?.pricePerGalon || (isPaint ? calculation.recommendedProduct.pricePerGalon : 28000),
        totalCostCOP: totalCostCOP,
        warehouseCity: selectedCatalogItem?.warehouseCity || city,
        warehouseName: selectedCatalogItem?.warehouseName || nearestWarehouse.name,
      };

      const allItems: OrderItem[] = [primaryItem, ...extraItems];
      const totalExtraCost = extraItems.reduce((acc, it) => acc + it.totalCostCOP, 0);
      const finalTotalCost = totalCostCOP + totalExtraCost;

      const newRequest: PaintRequest = {
        id: 'req-' + Date.now(),
        requestCode: `PTC-2026-${codeNumber}`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        clientName: currentUser.name,
        clientEmail: currentUser.email,
        clientPhone: currentUser.phone,
        city,
        deliveryAddress: deliveryAddress || `${city}, Colombia`,
        projectType,
        surfaceType: isPaint ? surfaceType : 'mamposteria_interior',
        environment: isPaint ? environment : 'interior',
        areaM2: isPaint ? Number(areaM2) : materialQuantity,
        colorName: finalColor,
        colorHex: isPaint ? (isCustomColorActive ? customColorHex : colorPresets.find(c => c.name === colorName)?.hex || '#86DEB8') : undefined,
        orderItemType: isPaint ? 'pintura' : 'material',
        materialQuantity: isPaint ? undefined : materialQuantity,
        catalogSku: selectedCatalogItem?.sku,
        catalogProductName: selectedCatalogItem?.productName,
        catalogUnitPrice: selectedCatalogItem?.unitPrice || selectedCatalogItem?.pricePerGalon || (isPaint ? calculation.recommendedProduct.pricePerGalon : 28000),
        items: allItems,
        notes: extraItems.length > 0
          ? `[Pedido con ${allItems.length} productos | ${allItems.map(i => `${i.quantity}x ${i.productName}`).join(', ')}] ${notes}`.trim()
          : selectedCatalogItem
          ? `[Catálogo SKU: ${selectedCatalogItem.sku} - ${selectedCatalogItem.productName}${!isPaint ? ` | Cantidad: ${materialQuantity} unidades` : ''}] ${notes}`.trim()
          : notes,
        requiresApplicationService: isPaint ? requiresApplicationService : false,
        status: 'solucion_tecnica',
        technicalCalculation: !isPaint ? {
          areaM2: materialQuantity,
          recommendedProduct: {
            id: selectedCatalogItem?.productId || selectedCatalogItem?.sku || 'mat-01',
            name: selectedCatalogItem?.productName || 'Material Pintuco',
            line: 'Preparación y Fondos',
            category: selectedCatalogItem?.category || 'Herramientas y Aplicación',
            description: `Material / Insumo despachado desde ${selectedCatalogItem?.warehouseName || city}`,
            coveragePerGalM2: 1,
            recommendedHands: 1,
            dilution: 'N/A',
            dryingTouchHours: 0,
            dryingTotalHours: 0,
            warrantyYears: 2,
            finishType: 'Mate',
            ecoFriendly: true,
            vocGramsLiter: 0,
            pricePerGalon: selectedCatalogItem?.pricePerGalon || 28000,
            availableSizes: ['1 Galón'],
          },
          handsNeeded: 1,
          totalGalons: materialQuantity,
          totalCuñetes: 0,
          remainderGalons: materialQuantity,
          primerGalons: 0,
          requiredSupplies: [{ name: selectedCatalogItem?.productName || 'Material', quantity: materialQuantity, unit: 'Unidades' }],
          estimatedMaterialCostCOP: finalTotalCost,
          preparationAdvice: ['Verificar estado del material al recibir en obra'],
          applicationInstructions: ['Uso profesional recomendado según ficha técnica Pintuco'],
          warrantyDurationYears: 2,
        } : {
          ...calculation,
          recommendedProduct: {
            ...calculation.recommendedProduct,
            name: chosenProdName,
            finishType,
          },
          estimatedMaterialCostCOP: finalTotalCost,
        },
        packagingDetails: {
          packerName: 'Javier Gómez (CEDI Rionegro)',
          batchCode: (selectedCatalogItem as any)?.batchCode || currentStockStatus.item?.batchCode || `LOTE-${(selectedCatalogItem?.sku || 'PTC').substring(0, 6)}-2026-X${codeNumber % 100}`,
          checkedSupplies: [],
          cuñetesPacked: isPaint ? (calculation.totalCuñetes || 0) : 0,
          galonesPacked: isPaint ? (calculation.remainderGalons || (calculation.totalCuñetes ? 0 : 1)) : materialQuantity,
          weightKg: isPaint ? Math.max(25, Math.round(Number(areaM2) * 0.75)) : Math.max(2, Math.round(materialQuantity * 0.5)),
          qualitySealAttached: false,
          qrInspectionCode: `QR-PKG-${codeNumber}`,
          status: 'pendiente',
          notes: extraItems.length > 0 ? `Pedido formulado con ${allItems.length} productos diferentes solicitados por el cliente.` : undefined,
        },
        deliveryDetails: {
          driverName: 'Wilson Cañas',
          driverPhone: '3123334455',
          vehiclePlate: 'WTL-582',
          vehicleType: 'Turbo FTR 4.5T Pintuco Express',
          routeStatus: 'en_ruta',
          currentLocation: `En muelle CEDI ${selectedCatalogItem?.warehouseCity || nearestWarehouse.city} listo para salida hacia ${city}`,
          deliveryAddress: deliveryAddress || `${city}, Colombia`,
          departedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
        inventoryAllocation: {
          warehouseCity: selectedCatalogItem?.warehouseCity || currentStockStatus.warehouseCity || nearestWarehouse.city,
          warehouseName: selectedCatalogItem?.warehouseName || currentStockStatus.warehouseName || nearestWarehouse.name,
          batchNumber: (selectedCatalogItem as any)?.batchCode || currentStockStatus.item?.batchCode || `LOTE-${(selectedCatalogItem?.sku || 'PTC').substring(0, 6)}-2026-X${codeNumber % 100}`,
          stockConfirmed: true,
          dispatchReadyDate: new Date(Date.now() + 86400000).toISOString().substring(0, 10),
        },
        serviceLogistics: (isPaint && requiresApplicationService)
          ? {
              certifiedCrewAssigned: 'Cuadrilla Especializada Pintuco Master',
              crewLead: 'Téc. Certificado Pintuco #COL-' + codeNumber,
              estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 10),
              applicationStartDate: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 10),
              estimatedDays: Math.max(1, Math.ceil(areaM2 / 80)),
              logisticsStatus: 'En alistamiento',
            }
          : undefined,
        qualityCertificate: {
          certificateId: `GAR-PTC-${codeNumber}9`,
          inspectorName: 'Ing. Calidad Pintuco Colombia',
          adhesionTest: 'Aprobado',
          substrateMoisture: 4.0,
          dryFilmThicknessMils: surfaceType === 'concreto_piso' ? 8.0 : 4.0,
          warrantyIssuedDate: new Date().toISOString().substring(0, 10),
          warrantyExpirationDate: new Date(Date.now() + 86400000 * 365 * (isPaint ? calculation.warrantyDurationYears : 2)).toISOString().substring(0, 10),
        },
      };

      onSubmitRequest(newRequest);
    }, 700);
  };

  const surfaces: { key: SurfaceType; label: string; desc: string; icon: string }[] = [
    { key: 'mamposteria_interior', label: 'Pared Interior', desc: 'Viniltex BioCuidado', icon: '🏠' },
    { key: 'fachada_exterior', label: 'Fachada Exterior', desc: 'Koraza Protección', icon: '🏢' },
    { key: 'metal_ferroso', label: 'Metales / Rejas', desc: 'Pintulux 3 en 1', icon: '⚙️' },
    { key: 'concreto_piso', label: 'Pisos / Bodegas', desc: 'Epóxico Pintucoat', icon: '🏭' },
    { key: 'madera', label: 'Maderas / Decks', desc: 'Maderprotect Barniz', icon: '🪵' },
    { key: 'humedad_salitre', label: 'Humedad Severa', desc: 'Sellomax + Koraza', icon: '💧' },
  ];

  const defaultColorPresets = [
    { name: 'Blanco Lirio Silvestre 01', hex: '#F9FAFB' },
    { name: 'Blanco Caliza', hex: '#FCFBF6' },
    { name: 'Lino Crudo', hex: '#F7F4EA' },
    { name: 'Gris Urbano Contemporáneo', hex: '#9CA3AF' },
    { name: 'Gris Basalto', hex: '#3D4B58' },
    { name: 'Azul Pintuco Zafiro', hex: '#1E3A8A' },
    { name: 'Mar Profundo', hex: '#21445B' },
    { name: 'Verde Eucalipto', hex: '#70CCA7' },
    { name: 'Verde Salvia Botánico', hex: '#A3B18A' },
    { name: 'Verde Bosque Andino', hex: '#2F5C4B' },
    { name: 'Terracota Colonial', hex: '#C86D51' },
    { name: 'Ocre Silvestre', hex: '#D4A24E' },
  ];

  const colorPresets = useMemo(() => {
    if (selectedCatalogItem?.availableColors && selectedCatalogItem.availableColors.length > 0) {
      return selectedCatalogItem.availableColors;
    }
    return defaultColorPresets;
  }, [selectedCatalogItem]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs" id="request-view-card">
      <div className="request-top flex justify-between items-center mb-2">
        <span className="card-eyebrow !mb-0" id="step-eyebrow">
          {selectedCatalogItem
            ? isPaint
              ? 'ORDEN DE PINTURA DEL CATÁLOGO'
              : 'ORDEN DE MATERIAL & HERRAMIENTAS'
            : 'PASO 1 DE 5 · FORMULACIÓN TÉCNICA'}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewTransversal}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 transition-colors cursor-pointer"
          >
            Vista 360° Reto
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="btn-ghost text-xs text-slate-500 hover:text-red-600 cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>
      </div>

      <div className="mini-stepper">
        <span className="mini-dot is-on" />
        <span className="mini-track is-on" />
        <span className="mini-dot" />
        <span className="mini-track" />
        <span className="mini-dot" />
        <span className="mini-track" />
        <span className="mini-dot" />
        <span className="mini-track" />
        <span className="mini-dot" />
      </div>
      <p className="mini-stepper-label">
        Solicitante: <strong className="text-navy-900">{currentUser.name}</strong> ({currentUser.city})
      </p>

      <div className="mb-4">
        <h2 className="card-title text-2xl" id="request-title">
          {selectedCatalogItem
            ? isPaint
              ? 'Personalizar Orden de Pintura Pintuco'
              : 'Detalles de Compra de Material / Insumo'
            : 'Registrar Requerimiento Técnico'}
        </h2>
        <p className="card-subtitle !mb-3">
          {selectedCatalogItem
            ? isPaint
              ? 'Elige el color y el acabado que deseas para tu pintura. El sistema calculará el volumen exacto y lo descontará del inventario CEDI.'
              : 'Indica la cantidad requerida de este material como en una tienda oficial. Se descontará del stock disponible de la bodega CEDI.'
            : 'Ingrese las especificaciones del área a intervenir. El sistema valida en tiempo real la disponibilidad en inventario CEDI.'}
        </p>
      </div>

      {/* ==========================================================
          ESPACIO REAL FORMULADO CON COLORLINK (AGREGADO AL PEDIDO)
          ========================================================== */}
      {initialPendingData?.roomTitle && (
        <div
          className="mb-5 p-4 rounded-2xl border-2 border-[#199ea5]/60 bg-gradient-to-r from-teal-50/90 via-[#f7f4ea] to-teal-50/90 text-slate-800 shadow-sm animate-fade-in"
          id="banner-formulated-space-added"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0 shadow-md border-2 border-white flex items-center justify-center font-bold text-xs ring-1 ring-teal-600/30"
                style={{ backgroundColor: initialPendingData.colorHex || '#86deb8' }}
              >
                <Sparkles className="w-6 h-6 text-white drop-shadow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#199ea5] text-white shadow-2xs">
                    ESPACIO FORMULADO CON COLORLINK
                  </span>
                  <span className="text-xs text-teal-800 font-semibold">✓ Agregado al pedido</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {initialPendingData.roomTitle}
                </h3>
                <p className="text-xs text-slate-600">
                  Producto: <strong className="text-slate-900">{initialPendingData.productName || 'Pintuco de alto desempeño'}</strong> · Tono: <strong className="text-slate-900">{initialPendingData.colorName}</strong> ({initialPendingData.colorHex}) · Área calculada: <strong className="text-teal-700">{areaM2} m²</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-white text-teal-800 border border-teal-200 font-bold text-xs shadow-2xs">
                Fórmula lista para confirmar
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          PRODUCTO AGREGADO DEL CATÁLOGO CEDI (DESTACADO Y VISIBLE)
          ========================================================== */}
      {selectedCatalogItem && (
        <div
          className={`mb-5 p-4 rounded-2xl border-2 text-slate-800 shadow-xs space-y-3 animate-fade-in ${
            isPaint
              ? 'bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border-teal-500/60'
              : 'bg-gradient-to-r from-amber-50 via-orange-50/40 to-amber-50 border-amber-500/60'
          }`}
          id="card-selected-catalog-product"
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white flex items-center gap-1.5 shadow-2xs ${
                isPaint ? 'bg-teal-700' : 'bg-amber-700'
              }`}
            >
              {isPaint ? <Paintbrush className="w-3.5 h-3.5" /> : <Boxes className="w-3.5 h-3.5" />}
              {isPaint ? 'PINTURA AGREGADA A LA SOLICITUD' : 'MATERIAL / INSUMO AGREGADO A LA SOLICITUD'}
            </span>
            {onClearSelectedCatalogItem && (
              <button
                type="button"
                onClick={onClearSelectedCatalogItem}
                className="text-[11px] text-red-700 hover:text-red-900 font-bold underline transition-colors cursor-pointer"
                id="btn-remove-catalog-selection"
              >
                ✕ Cambiar por formulación libre
              </button>
            )}
          </div>

          <div className="flex items-start justify-between gap-3 pt-1">
            <div>
              <h3 className="font-bold text-navy-900 text-base leading-snug">
                {selectedCatalogItem.productName}
              </h3>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                SKU: <strong className="text-teal-900 font-bold">{selectedCatalogItem.sku}</strong> · Categoría: {selectedCatalogItem.category}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-500 block">Precio Ref.</span>
              <span className="font-mono font-bold text-sm text-navy-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 block shadow-2xs">
                ${(selectedCatalogItem.pricePerGalon || 28000).toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-700 font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-700" />
              Bodega CEDI: <strong>{selectedCatalogItem.warehouseName}</strong> ({selectedCatalogItem.warehouseCity})
            </span>
            <span className="font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {isPaint
                ? `Stock CEDI: ${selectedCatalogItem.cuñetesAvailable} Cuñetes / ${selectedCatalogItem.galonesAvailable} Gal`
                : `Stock CEDI: ${selectedCatalogItem.unitsAvailable ?? selectedCatalogItem.galonesAvailable ?? selectedCatalogItem.totalLiters ?? 0} Unidades disponibles`}
            </span>
          </div>
        </div>
      )}

      {stockError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center justify-between gap-2">
          <span>{stockError}</span>
          <button
            type="button"
            onClick={() => setStockError('')}
            className="text-red-600 hover:text-red-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} id="request-paint-form" className="mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ==========================================================
              COLUMNA IZQUIERDA (7 cols): Datos de la Obra y Configuración
              ========================================================== */}
          <div className="lg:col-span-7 space-y-4">
            {/* Botón Asistente IA si es Pintura */}
            {isPaint && (
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="w-full p-3 bg-gradient-to-r from-teal-800/10 via-blue-800/10 to-teal-800/10 border border-teal-500/30 rounded-xl flex items-center justify-between hover:border-teal-500/60 transition-all text-left group cursor-pointer"
                id="btn-trigger-ai-advising"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                      Asistente Inteligente Pintuco IA
                      <span className="text-[10px] font-mono bg-teal-600 text-white px-1.5 py-0.2 rounded">Recomendador</span>
                    </p>
                    <p className="text-[11.5px] text-slate-600">
                      ¿Dudas sobre rendimiento o color? Consulta las recomendaciones de ingeniería Pintuco.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-700 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* CASO A: SI ES UN MATERIAL / HERRAMIENTA (NO PINTURA) */}
            {!isPaint && selectedCatalogItem ? (
              <div className="space-y-4">
                {/* Selector de Cantidad Estilo E-commerce Real */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-navy-900 block">
                        Cantidad a Pedir (Unidades / Rollos / Piezas)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Selecciona las unidades requeridas para despacho inmediato desde bodega CEDI.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      Stock: {selectedCatalogItem.unitsAvailable ?? selectedCatalogItem.galonesAvailable ?? selectedCatalogItem.totalLiters ?? 0} uds
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setMaterialQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
                      disabled={materialQuantity <= 1}
                      id="btn-qty-minus"
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    <input
                      type="number"
                      min={1}
                      max={selectedCatalogItem.unitsAvailable ?? selectedCatalogItem.galonesAvailable ?? 999}
                      value={materialQuantity}
                      onChange={(e) => {
                        const maxStock = selectedCatalogItem.unitsAvailable ?? selectedCatalogItem.galonesAvailable ?? 999;
                        const val = Math.max(1, Math.min(Number(e.target.value) || 1, maxStock));
                        setMaterialQuantity(val);
                      }}
                      className="w-24 text-center font-mono font-bold text-lg py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      id="input-material-qty"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMaterialQuantity((prev) =>
                          Math.min(selectedCatalogItem.unitsAvailable ?? selectedCatalogItem.galonesAvailable ?? 999, prev + 1)
                        )
                      }
                      className="w-11 h-11 rounded-xl bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-40"
                      disabled={materialQuantity >= (selectedCatalogItem.unitsAvailable ?? selectedCatalogItem.galonesAvailable ?? 999)}
                      id="btn-qty-plus"
                    >
                      <Plus className="w-5 h-5" />
                    </button>

                    <div className="ml-auto text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Subtotal</span>
                      <span className="font-mono text-lg font-bold text-teal-900">
                        ${totalCostCOP.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fila: Segmento de Proyecto y Ciudad */}
                <div className="field-row">
                  <Field
                    id="req-project-type"
                    label="Segmento de Proyecto"
                    type="select"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as any)}
                    icon={<Building className="w-4 h-4" />}
                    options={[
                      { value: 'Residencial', label: 'Residencial (Casas / Aptos)' },
                      { value: 'Comercial', label: 'Comercial (Locales / Oficinas)' },
                      { value: 'Industrial', label: 'Industrial (Plantas / Bodegas)' },
                      { value: 'Institucional', label: 'Institucional (Salud / Edu)' },
                    ]}
                  />

                  <Field
                    id="req-city"
                    label="Ciudad de Despacho & CEDI"
                    type="select"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    icon={<MapPin className="w-4 h-4" />}
                    disabled={currentUser.role === 'cliente'}
                    hint={currentUser.role === 'cliente' ? `Sede CEDI asignada a tu cuenta (${currentUser.city || 'Medellín'})` : undefined}
                    options={[
                      { value: 'Medellín', label: 'Medellín (Planta Rionegro)' },
                      { value: 'Bogotá D.C.', label: 'Bogotá D.C. (Siberia)' },
                      { value: 'Cali', label: 'Cali (Acopi Yumbo)' },
                      { value: 'Barranquilla', label: 'Barranquilla (Galapa)' },
                      { value: 'Bucaramanga', label: 'Bucaramanga (Girón)' },
                    ]}
                  />
                </div>

                {/* Dirección de entrega */}
                <Field
                  id="req-delivery-address"
                  label="Dirección de Entrega en Obra"
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Ej. Calle 45 # 22-80, Medellín"
                  icon={<MapPin className="w-4 h-4" />}
                  required
                />
              </div>
            ) : (
              /* CASO B: SI ES PINTURA (O FORMULACIÓN LIBRE) */
              <div className="space-y-4">
                {/* SELECCIÓN DE COLOR EXCLUSIVA DE PINTURAS */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3" id="box-paint-color-selector">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                        <Paintbrush className="w-4 h-4 text-teal-700" />
                        <span>Elige el Color para tu Pintura Pintuco</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Elige un tono de nuestra paleta oficial o selecciona tu color personalizado mediante código Hexadecimal.
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-200">
                      {isCustomColorActive ? `Personalizado (${customColorHex})` : colorName}
                    </span>
                  </div>

                  {/* Muestras Predefinidas Pintuco */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                    {colorPresets.map((c) => {
                      const isSelected = !isCustomColorActive && colorName === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setColorName(c.name);
                            setIsCustomColorActive(false);
                          }}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-teal-700 bg-teal-50/70 font-bold shadow-2xs ring-1 ring-teal-600'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: c.hex }}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-slate-800" />}
                          </span>
                          <span className="truncate text-[11px]">{c.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selector de Color Personalizado Libre (Color Picker) */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={customColorHex}
                        onChange={(e) => {
                          setCustomColorHex(e.target.value);
                          setIsCustomColorActive(true);
                        }}
                        className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white shadow-2xs"
                        title="Elegir tono personalizado libre"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          ¿Deseas otro color libre?
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Hex: <strong className="text-teal-800">{customColorHex.toUpperCase()}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCustomColorActive(true)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                        isCustomColorActive
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      Usar Color Libre
                    </button>
                  </div>

                  {/* Selector de Acabado */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-600">Acabado deseado:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(['Mate', 'Satinado', 'Semibrillante', 'Brillante'] as const).map((finish) => (
                        <button
                          key={finish}
                          type="button"
                          onClick={() => setFinishType(finish)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            finishType === finish
                              ? 'bg-teal-700 text-white border-teal-700 shadow-2xs font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {finish}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selector de Superficie (solo si no viene fijado por catálogo) */}
                {!selectedCatalogItem && (
                  <div className="field">
                    <label className="text-xs font-semibold text-navy-900 flex justify-between items-center">
                      <span>Tipo de Superficie / Sustrato</span>
                      <span className="text-[11px] font-normal text-slate-500">Seleccione el sustrato</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {surfaces.map((s) => {
                        const isSelected = surfaceType === s.key;
                        const stock = checkInventoryStock(s.key, inventoryList, city);
                        const isItemAvailable = stock.isAvailable;

                        return (
                          <button
                            key={s.key}
                            type="button"
                            onClick={() => {
                              setSurfaceType(s.key);
                              if (s.key === 'fachada_exterior') setEnvironment('exterior');
                              else if (s.key === 'concreto_piso') setEnvironment('industrial');
                              else if (s.key === 'humedad_salitre') setEnvironment('alta_humedad');
                              else setEnvironment('interior');
                            }}
                            className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between relative cursor-pointer ${
                              isSelected
                                ? isItemAvailable
                                  ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600'
                                  : 'border-red-500 bg-red-50/70 shadow-xs ring-1 ring-red-500'
                                : isItemAvailable
                                ? 'border-slate-200 bg-white hover:border-slate-300'
                                : 'border-red-200 bg-red-50/30 opacity-75'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-lg">{s.icon}</span>
                              {isSelected ? (
                                <span className={`w-2 h-2 rounded-full ${isItemAvailable ? 'bg-teal-600' : 'bg-red-500'}`} />
                              ) : !isItemAvailable ? (
                                <span className="text-[9px] font-mono font-bold bg-red-100 text-red-700 px-1 py-0.2 rounded border border-red-300">
                                  SIN STOCK
                                </span>
                              ) : null}
                            </div>
                            <div>
                              <p className={`text-xs font-bold leading-tight ${isSelected ? (isItemAvailable ? 'text-teal-900' : 'text-red-900') : 'text-slate-800'}`}>
                                {s.label}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{s.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Fila: Área en m2 y Segmento */}
                <div className="field-row">
                  <Field
                    id="req-area"
                    label="Área total a pintar (m²)"
                    type="number"
                    value={areaM2}
                    onChange={(e) => setAreaM2(Number(e.target.value))}
                    placeholder="Ej. 120"
                    min={1}
                    max={50000}
                    icon={<Layers className="w-4 h-4" />}
                    hint="Mide alto × ancho de cada pared"
                    required
                  />

                  <Field
                    id="req-project-type"
                    label="Segmento de Proyecto"
                    type="select"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as any)}
                    icon={<Building className="w-4 h-4" />}
                    options={[
                      { value: 'Residencial', label: 'Residencial (Casas / Aptos)' },
                      { value: 'Comercial', label: 'Comercial (Locales / Oficinas)' },
                      { value: 'Industrial', label: 'Industrial (Plantas / Bodegas)' },
                      { value: 'Institucional', label: 'Institucional (Salud / Edu)' },
                    ]}
                  />
                </div>

                {/* Ciudad y Condición Ambiental */}
                <div className="field-row">
                  <Field
                    id="req-city"
                    label="Ciudad del Proyecto & CEDI"
                    type="select"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    icon={<MapPin className="w-4 h-4" />}
                    disabled={currentUser.role === 'cliente'}
                    hint={currentUser.role === 'cliente' ? `Sede CEDI asignada a tu cuenta (${currentUser.city || 'Medellín'})` : undefined}
                    options={[
                      { value: 'Medellín', label: 'Medellín (Planta Rionegro)' },
                      { value: 'Bogotá D.C.', label: 'Bogotá D.C. (Siberia)' },
                      { value: 'Cali', label: 'Cali (Acopi Yumbo)' },
                      { value: 'Barranquilla', label: 'Barranquilla (Galapa)' },
                      { value: 'Bucaramanga', label: 'Bucaramanga (Girón)' },
                    ]}
                  />

                  <Field
                    id="req-environment"
                    label="Condición Ambiental"
                    type="select"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as EnvironmentType)}
                    options={[
                      { value: 'interior', label: 'Interior Normal' },
                      { value: 'exterior', label: 'Exterior Intemperie' },
                      { value: 'alta_humedad', label: 'Humedad Alta / Baños / Cocinas' },
                      { value: 'industrial', label: 'Industrial Químico / Mecánico' },
                      { value: 'marino', label: 'Ambiente Marino / Costero' },
                    ]}
                  />
                </div>

                {/* Dirección de entrega */}
                <Field
                  id="req-delivery-address-paint"
                  label="Dirección de Entrega en Obra"
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Ej. Calle 45 # 22-80, Medellín"
                  icon={<MapPin className="w-4 h-4" />}
                  required
                />

                {/* Checkbox de servicio de aplicación */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="chk-application-service"
                      checked={requiresApplicationService}
                      onChange={(e) => setRequiresApplicationService(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500 cursor-pointer"
                    />
                    <label htmlFor="chk-application-service" className="text-xs text-slate-800 cursor-pointer">
                      <strong className="text-navy-900 block">Incluir cuadrilla de aplicación certificada</strong>
                      Pintores profesionales avalados por Pintuco con inspección de calidad
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Observaciones Generales */}
            <Field
              id="req-notes"
              label="Observaciones o instrucciones de entrega (Opcional)"
              type="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Indique detalles de recepción, torre, piso, contacto en obra o especificaciones adicionales..."
              rows={2}
            />
          </div>

          {/* ==========================================================
              COLUMNA DERECHA (5 cols): Resumen Técnico Dinámico & Confirmación
              ========================================================== */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            {isPaint ? (
              /* Tarjeta de Cálculo Técnico Dinámico de Pintura */
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2c3844] via-[#1f2937] to-[#111827] text-white border border-slate-700 shadow-md space-y-3.5" id="live-technical-summary-box">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <Paintbrush className="w-4 h-4 text-teal-400" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-teal-300 font-semibold">
                      Formulación Técnica Pintuco en Vivo
                    </span>
                  </div>
                  <span className="text-xs font-mono bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
                    Garantía {calculation.warrantyDurationYears} Años
                  </span>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-white/15">
                      <img
                        src={getProductImage({
                          productName: calculation.recommendedProduct.name,
                          category: calculation.recommendedProduct.category,
                        })}
                        alt={calculation.recommendedProduct.name}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: isCustomColorActive ? customColorHex : (colorPresets.find(c => c.name === colorName)?.hex || '#86DEB8') }}
                        title={colorName}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-400 text-[10px] uppercase font-mono">Producto formulado:</p>
                      <p className="font-bold text-teal-200 text-xs sm:text-sm truncate">{calculation.recommendedProduct.name}</p>
                      <p className="text-[11px] text-slate-300">
                        {calculation.handsNeeded} manos recomendadas · Acabado {finishType}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[11px]">Volumen exacto calculado:</p>
                      <p className="font-mono font-bold text-amber-300 text-base">
                        {calculation.totalCuñetes > 0 && `${calculation.totalCuñetes} Cuñete(s) + `}
                        {calculation.remainderGalons} Galón(es)
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-300 font-mono">
                      ({calculation.totalGalons} gal. totales)
                    </span>
                  </div>
                </div>

                {calculation.recommendedPrimerProduct && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      Fondo sellador: {calculation.recommendedPrimerProduct.name}
                    </span>
                    <span className="font-mono text-teal-300 font-semibold">
                      {calculation.primerGalons} Gal
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                  <span className="text-slate-300 text-xs">Costo estimado pintura:</span>
                  <span className="font-mono text-lg font-bold text-teal-300">
                    ${(totalCostCOP || 0).toLocaleString('es-CO')} COP
                  </span>
                </div>

                {/* Verificación de inventario */}
                {currentStockStatus.isAvailable ? (
                  <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/30">
                    <span className="text-emerald-300 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Stock en {currentStockStatus.warehouseCity}:
                    </span>
                    <span className="font-mono text-emerald-200 font-bold">
                      {currentStockStatus.totalCuñetes} Cuñetes / {currentStockStatus.totalGalones} Gal disp.
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 p-3 bg-red-950/90 border border-red-500/80 rounded-xl text-red-100 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs text-red-200">
                        🚫 PRODUCTO AGOTADO EN INVENTARIO CEDI
                      </p>
                      <p className="text-[11px] text-red-300 mt-0.5 leading-relaxed">
                        El producto seleccionado no cuenta con stock en {city}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Tarjeta de Resumen para Materiales / Herramientas */
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-amber-950/90 text-white border border-amber-600/30 shadow-md space-y-3.5" id="live-material-summary-box">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-amber-300 font-semibold">
                      Resumen de Orden · Despacho CEDI
                    </span>
                  </div>
                  <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    Venta por Unidad
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Artículo Solicitado:</span>
                    <p className="font-bold text-white text-sm">{selectedCatalogItem?.productName}</p>
                    <p className="text-[11px] text-amber-300 font-mono mt-0.5">SKU: {selectedCatalogItem?.sku}</p>
                  </div>

                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Unidades a despachar:</span>
                      <span className="text-base font-bold font-mono text-amber-300">{materialQuantity} unidades</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Precio Unitario:</span>
                      <span className="text-xs font-bold font-mono text-white">
                        ${(selectedCatalogItem?.pricePerGalon || 28000).toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                  <span className="text-slate-300 text-xs">Total Pedido:</span>
                  <span className="font-mono text-lg font-bold text-amber-300">
                    ${(totalCostCOP || 0).toLocaleString('es-CO')} COP
                  </span>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/30">
                  <span className="text-emerald-300 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Bodega CEDI {selectedCatalogItem?.warehouseCity}:
                  </span>
                  <span className="font-mono text-emerald-200 font-bold">
                    {selectedCatalogItem?.unitsAvailable ?? selectedCatalogItem?.galonesAvailable ?? 0} disp.
                  </span>
                </div>
              </div>
            )}

            {/* SECCIÓN: AGREGAR MÁS PRODUCTOS AL MISMO PEDIDO */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold font-mono uppercase text-slate-800">
                    Productos Adicionales en este Pedido ({extraItems.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (inventoryList.length > 0) {
                      setSelectedExtraProduct(inventoryList[0]);
                    }
                    setShowAddExtraModal(true);
                  }}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Producto</span>
                </button>
              </div>

              {extraItems.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">
                  ¿Necesitas rodillos, brochas, sellador u otra pintura? Puedes agregarlos aquí para que viajen en la misma orden y el mismo camión.
                </p>
              ) : (
                <div className="space-y-2">
                  {extraItems.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {ex.quantity}x {ex.productName} ({ex.presentation === 'cuñete' ? 'Cuñete (5 Gal)' : ex.presentation === 'galon' ? 'Galón' : 'und'})
                        </div>
                        {ex.colorName && ex.colorName !== 'N/A' && (
                          <div className="text-[10.5px] text-teal-700 font-mono">
                            Color: {ex.colorName}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          ${ex.totalCostCOP.toLocaleString('es-CO')} COP
                        </span>
                        <button
                          type="button"
                          onClick={() => setExtraItems((prev) => prev.filter((p) => p.id !== ex.id))}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                          title="Eliminar ítem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-500">Subtotal Adicionales:</span>
                    <span className="font-bold text-slate-900">
                      ${extraItems.reduce((acc, it) => acc + it.totalCostCOP, 0).toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL PARA AGREGAR PRODUCTOS EXTRA - DIMENSIONES CONTROLADAS */}
            {showAddExtraModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
                  <div className="bg-gradient-to-r from-[#0F1E36] via-[#1E2E4B] to-[#0F1E36] p-4 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-amber-400" />
                      <h3 className="font-bold text-sm">Agregar Producto Adicional</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddExtraModal(false)}
                      className="text-white/70 hover:text-white font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3.5 flex-1 min-h-0 overflow-y-auto">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Selecciona el Producto del Catálogo:
                      </label>
                      <select
                        value={selectedExtraProduct?.id || ''}
                        onChange={(e) => {
                          const p = inventoryList.find((i) => i.id === e.target.value);
                          if (p) {
                            setSelectedExtraProduct(p);
                            setExtraFormat(isPaintProduct(p) ? 'galon' : 'unidad');
                          }
                        }}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 bg-slate-50 cursor-pointer"
                      >
                        {inventoryList.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.productName} ({item.category}) - ${(item.pricePerGalon || item.unitPrice || 28000).toLocaleString('es-CO')}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedExtraProduct && isPaintProduct(selectedExtraProduct) && (
                      <>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Formato de Presentación:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setExtraFormat('galon')}
                              className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                extraFormat === 'galon'
                                  ? 'bg-amber-50 border-amber-500 text-slate-900 ring-1 ring-amber-400'
                                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              Galón (1 Gal)
                            </button>
                            <button
                              type="button"
                              onClick={() => setExtraFormat('cuñete')}
                              className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                extraFormat === 'cuñete'
                                  ? 'bg-amber-50 border-amber-500 text-slate-900 ring-1 ring-amber-400'
                                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              Cuñete (5 Gal)
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Color:
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
                            {(selectedExtraProduct.availableColors || defaultColorPresets).map((c, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setExtraColor(c)}
                                className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                                  extraColor.name === c.name
                                    ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-400/20 font-semibold'
                                    : 'border-slate-200 bg-white/70'
                                }`}
                              >
                                <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: c.hex }} />
                                <span className="text-[11px] font-semibold text-slate-800 truncate">{c.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Cantidad:
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExtraQty(Math.max(1, extraQty - 1))}
                          className="px-3 py-1.5 bg-slate-100 rounded-lg font-bold text-sm hover:bg-slate-200 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-4 py-1.5 font-mono font-bold text-sm">{extraQty}</span>
                        <button
                          type="button"
                          onClick={() => setExtraQty(extraQty + 1)}
                          className="px-3 py-1.5 bg-slate-100 rounded-lg font-bold text-sm hover:bg-slate-200 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAddExtraModal(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleAddExtraItem}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Añadir al Pedido
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de Enviar Pedido */}
            <button
              type="submit"
              id="btn-submit-paint-request"
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                !currentStockStatus.isAvailable
                  ? 'bg-slate-700 text-slate-300 cursor-not-allowed border border-slate-600 shadow-none'
                  : isPaint
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
              }`}
              disabled={!currentStockStatus.isAvailable || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full spin" />
                  <span>Descontando inventario y generando orden en tiempo real...</span>
                </span>
              ) : !currentStockStatus.isAvailable ? (
                <span className="flex items-center gap-2 justify-center text-red-200">
                  <Lock className="w-4 h-4 text-red-400" />
                  <span>Bloqueado: Sin existencias en CEDI</span>
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center text-sm">
                  {!isPaint
                    ? `🛒 Confirmar Pedido (${extraItems.length > 0 ? `${extraItems.length + 1} productos - ` : ''}$${(totalCostCOP + extraItems.reduce((acc, it) => acc + it.totalCostCOP, 0)).toLocaleString('es-CO')} COP)`
                    : `🎨 Generar Orden (${extraItems.length > 0 ? `${extraItems.length + 1} productos - ` : ''}$${(totalCostCOP + extraItems.reduce((acc, it) => acc + it.totalCostCOP, 0)).toLocaleString('es-CO')} COP)`}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>

            {/* Sello de Confianza y Respaldo Pintuco */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Garantía Oficial Pintuco S.A.</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Despacho directo desde planta o bodega CEDI autorizada con certificado de calidad y factura electrónica DIAN.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
