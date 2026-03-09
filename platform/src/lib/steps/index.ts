export interface Step {
  id: number
  label: string
  path: string
  taskStatus: string[]
}

export const defaultSteps: Step[] = [
  {
    id: 1,
    label: 'Upload File',
    path: '/upload',
    taskStatus: ['CREATED']
  },
  {
    id: 2,
    label: 'Select Compliance Tests',
    path: '/compliance',
    taskStatus: ['FULFILLED']
  },
  {
    id: 3,
    label: 'Report',
    path: '/report',
    taskStatus: ['PENDING', 'COMPLETED']
  },
]
