export interface Skid {
  id: number
  project_number: string
  vessel_name: string | null
  yard: string | null
  date: string | null
  location: string | null
  length_mm: number | null
  width_mm: number | null
  height_mm: number | null
  weight_empty_kg: number | null
  weight_operational_kg: number | null
  frame_material: string | null
  frame_finish: string | null
  pool_volume_m3: number | null
  dump_tank_volume_m3: number | null
  filter_pump_m3h: number | null
  sand_filter_m3h: number | null
  jetstream_pump_a_m3h: number | null
  jetstream_pump_b_m3h: number | null
  fill_pump_m3h: number | null
  heater_total_kw: number | null
  heater_count: number | null
  heat_exchanger_kw: number | null
  uv_sterilizer_m3h: number | null
  seawater_system: boolean | null
  seawater_pump_m3h: number | null
  awt_dosing_pumps: number | null
  suction_dn: number | null
  pressure_dn: number | null
  overboard_dn: number | null
  drain_dn: number | null
  is_standard: boolean | null
  notes: string | null
  source_skid_url: string | null
  source_pid_url: string | null
  created_at: string
  similarity?: number
}
