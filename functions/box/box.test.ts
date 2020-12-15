import { health } from 'box';
import vals from '../shared/example';

test('smoke test', async () => {
  const response = await health();
  expect(JSON.parse(response.body).vals).toStrictEqual(vals);
});
