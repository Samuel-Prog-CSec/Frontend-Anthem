/**
 * Barrel export de hooks de React Query
 */

export { useUbicaciones, useUbicacionesStats, usePuntosMedicion, useRutasTransporte } from './useUbicaciones';
export { useCalidadAire, useCalidadAireStats, useCalidadAireTendencias } from './useCalidadAire';
export { useRuido, useEstacionesRuido, useRuidoStats, useRuidoRanking, useRuidoCumplimiento, useRuidoTendencias } from './useRuido';
export { usePatinetes, usePatinetesEstadisticas, usePatinetesMercado, usePatinetesZonas, usePatinetesDetallesArea } from './usePatinetes';
export { useAccidentes, useAccidenteExpediente, useAccidentesEstadisticas, useAccidentesComparativa, useAccidentesMapaCalor } from './useAccidentes';
export { useBicicletas, useBicicletasEstadisticas, useBicicletasTendencias, useBicicletasMayorUso, useBicicletasSuscripciones } from './useBicicletas';
export { useCenso, useCensoPiramide, useCensoDistritos, useCensoAnalisis, useCensoEvolucion, useCensoDashboard, useCensoResumenDistritos } from './useCenso';
export { useDistritoPorCodigo } from './useDistritoPorCodigo';
export { useDistritoPorNombre } from './useDistritoPorNombre';
export { useMultas, useMultaDetalle, useMultasEstadisticas, useMultasRanking, useMultasTemporal, useMultasDashboard } from './useMultas';
export { useAforoBicicletas, useAforoEstacion, useAforoEstadisticas, useAforoDistribucionHoraria, useAforoEstaciones, useAforoTendencias } from './useAforoBicicletas';
export {
  useAforoPeatones,
  useAforoPeatonesEstacion,
  useAforoPeatonesEstadisticas,
  useAforoPeatonesDistribucionHoraria,
  useAforoPeatonesEstaciones,
  useAforoPeatonesTendencias,
  useMapaAforoPeatones
} from './useAforoPeatones';
export {
  useContenedores,
  useContenedoresEstadisticas,
  useContenedoresPorDistrito,
  useContenedoresPorBarrio,
  useContenedoresCercanos,
  useConteoContenedoresPorTipo,
  useDistritosContenedores,
  useBarriosContenedores,
  useBuscarContenedores,
  useMapaCalorContenedores,
  useCoberturaContenedores,
  useDensidadContenedores
} from './useContenedores';
export {
  useMapaUbicaciones,
  useMapaAccidentes,
  useMapaPatinetes,
  useMapaAforo,
  useMapaRuido,
  useMapaMultas,
  useMapaContenedores,
  useMapaTrafico
} from './useMapas';
export {
  useTrafico,
  usePuntoTrafico,
  useEstadisticasTrafico,
  useAnalisisCongestion,
  useHistoricoTrafico
} from './useTrafico';
