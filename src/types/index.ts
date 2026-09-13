export type TimeToAdoption = 'lt2' | '2to5' | '5to10' | 'gt10' | 'obsolete'

export type Stage =
  | 'innovation_trigger'
  | 'peak_of_expectations'
  | 'trough_of_disillusionment'
  | 'slope_of_enlightenment'
  | 'plateau_of_productivity'

export interface Entry {
  id: string
  keyword: string
  timeToAdoption: TimeToAdoption
  stage: Stage
  position: number // [0, 1] within the stage
}

export const STAGE_LABELS: Record<Stage, string> = {
  innovation_trigger: '黎明期',
  peak_of_expectations: 'ピーク期',
  trough_of_disillusionment: '幻滅期',
  slope_of_enlightenment: '啓発期',
  plateau_of_productivity: '安定期',
}

export const TIME_LABELS: Record<TimeToAdoption, string> = {
  lt2: '2年未満',
  '2to5': '2〜5年',
  '5to10': '5〜10年',
  gt10: '10年以上',
  obsolete: '陳腐化',
}

export const STAGES: Stage[] = [
  'innovation_trigger',
  'peak_of_expectations',
  'trough_of_disillusionment',
  'slope_of_enlightenment',
  'plateau_of_productivity',
]

export const TIME_TO_ADOPTIONS: TimeToAdoption[] = [
  'lt2',
  '2to5',
  '5to10',
  'gt10',
  'obsolete',
]
