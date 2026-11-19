import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { MetricCard } from '@/components/metric-card';
import { lightTheme } from '@/theme/theme';

async function renderCard(props: Parameters<typeof MetricCard>[0]) {
  await render(
    <PaperProvider theme={lightTheme}>
      <MetricCard {...props} />
    </PaperProvider>,
  );
}

describe('MetricCard', () => {
  it('shows progress towards the goal', async () => {
    await renderCard({ metric: 'steps', value: 6200, goal: 10000 });

    expect(screen.getByText('62% of 10,000 steps goal')).toBeOnTheScreen();
    expect(screen.getByLabelText('Steps: 6,200 steps. 62% of 10,000 steps goal')).toBeOnTheScreen();
  });

  it('says when the goal is reached', async () => {
    await renderCard({ metric: 'water', value: 2400, goal: 2000 });

    expect(screen.getByText('Goal of 2,000 reached')).toBeOnTheScreen();
  });

  it('shows just the value without a goal', async () => {
    await renderCard({ metric: 'calories', value: 420 });

    expect(screen.getByLabelText('Calories burned: 420 kcal')).toBeOnTheScreen();
    expect(screen.queryByText(/goal/)).toBeNull();
  });
});
