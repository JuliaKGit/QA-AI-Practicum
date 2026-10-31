import { DashboardPage } from '../../pages/dashboard.page';
import { createApiContextForOwner } from '../../support/api-client';
import { test, expect, trackRecord } from '../../fixtures/cleanup.fixture';
import { buildCreateChildPayload } from '../../test-data/factories/child.factory';

const CHILDREN_PATH = '/api/v1/children';

interface MeChild {
  id: string;
  firstName: string;
  age: number;
  gender: string;
}

interface MeResponse {
  family: { name: string; children: MeChild[] };
}

function genderLabel(gender: string): string {
  if (gender === 'boy') return 'Boy';
  if (gender === 'girl') return 'Girl';
  return gender;
}

function childSummaryLine(child: Pick<MeChild, 'firstName' | 'age' | 'gender'>): string {
  return `${child.firstName}, ${child.age} · ${genderLabel(child.gender)}`;
}

test(
  'API arrange → UI check/act → API prove for disposable child',
  { tag: '@destructive' },
  async ({ page, recordOwner }) => {
    let childId = '';
    let summaryLine = '';
    let familyName = '';
    let myKidsBaseline = 0;

    await test.step('API: arrange', async () => {
      const api = await createApiContextForOwner('main');
      const meResponse = await api.get('/api/v1/me');
      expect(meResponse.ok()).toBeTruthy();
      const me = (await meResponse.json()) as MeResponse;
      familyName = me.family.name;
      myKidsBaseline = me.family.children.length;

      const payload = buildCreateChildPayload();
      const createResponse = await api.post(CHILDREN_PATH, { data: payload });
      expect(createResponse.status()).toBe(201);
      const created = (await createResponse.json()) as MeChild;
      childId = created.id;
      summaryLine = childSummaryLine(created);
      trackRecord({ type: 'child', id: childId, owner: recordOwner });
      await api.dispose();
    });

    await test.step('UI: check', async () => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      await expect(dashboard.dashboardBanner).toBeVisible();
      await expect(dashboard.childSummaryLocator(familyName, summaryLine)).toBeVisible();
      await expect.poll(() => dashboard.getMyKidsCount()).toBe(myKidsBaseline + 1);
    });

    await test.step('UI: act', async () => {
      const dashboard = new DashboardPage(page);
      await dashboard.removeChild(familyName, summaryLine);
      await expect(dashboard.childSummaryLocator(familyName, summaryLine)).toBeHidden();
    });

    await test.step('API: prove', async () => {
      const api = await createApiContextForOwner('main');
      await expect.poll(async () => {
        const response = await api.get('/api/v1/me');
        expect(response.ok()).toBeTruthy();
        const me = (await response.json()) as MeResponse;
        return me.family.children.some((child) => child.id === childId);
      }).toBe(false);
      await api.dispose();
    });
  },
);
