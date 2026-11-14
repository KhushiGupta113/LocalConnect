export type Neighborhood = {
  id: string;
  name: string;
  detail: string;
};

export const neighborhoods: Neighborhood[] = [
  {
    id: 'oakridge',
    name: 'Oakridge Commons, Portland',
    detail: 'Ward 4 • Southwest Precinct Boundary',
  },
  {
    id: 'maple',
    name: 'Maple Avenue, Portland',
    detail: 'Ward 4 • East Block',
  },
  {
    id: 'fourth',
    name: '4th Street, Portland',
    detail: 'Ward 3 • Riverside',
  },
  {
    id: 'gazebo',
    name: 'Gazebo Plots, Oakridge',
    detail: 'Ward 4 • Community Garden',
  },
];

export const defaultNeighborhood = neighborhoods[0];
