import fs from 'fs';
import path from 'path';
import { screens, screensById, type ScreenAction, type ScreenId } from './screens';

const appDir = path.join(__dirname, '..', '..', 'app');
const allTargets = (id: ScreenId): ScreenAction[] => {
  const s = screensById[id];
  return [...s.actions, ...(s.links ?? []), ...(s.pretendPush ?? []), ...(s.banner?.actions ?? [])];
};

describe('stage 1 screen map (PRD 3.4)', () => {
  it('has exactly S1 to S32, once each (S31 Sign in and S32 Unlock added by the founder)', () => {
    expect(screens.map((s) => s.id)).toEqual(
      Array.from({ length: 32 }, (_, i) => `S${i + 1}`),
    );
  });

  it('sends S1 Sign in to S31, and S31 and S32 to Home', () => {
    expect(screensById.S1.actions.find((a) => a.label === 'Sign in')?.to).toBe('S31');
    expect(screensById.S31.actions.map((a) => a.to)).toEqual(['S15']);
    expect(screensById.S32.actions.map((a) => a.to)).toEqual(['S15']);
  });

  it('sends S17 Hold to Home, and the Home banner to S17 and S29', () => {
    expect(screensById.S17.actions.find((a) => a.label === 'Hold')?.to).toBe('S15');
    expect(screensById.S15.banner?.text).toBe('₦380,000 held, not split yet');
    expect(screensById.S15.banner?.actions.map((a) => [a.label, a.to])).toEqual([
      ['Split now', 'S17'],
      ['Send to my account', 'S29'],
    ]);
  });

  it('has a route file in app/ for every screen', () => {
    for (const s of screens) {
      const file = path.join(appDir, s.tab ? '(tabs)' : '', `${s.route.slice(1)}.tsx`);
      expect({ id: s.id, exists: fs.existsSync(file) }).toEqual({ id: s.id, exists: true });
    }
  });

  it('puts exactly Home, Plan, Activity and Profile behind the nav', () => {
    expect(screens.filter((s) => s.tab).map((s) => s.id)).toEqual(['S6', 'S15', 'S19', 'S22']);
  });

  it('only links to screens that exist', () => {
    for (const s of screens) {
      for (const a of allTargets(s.id)) expect(screensById[a.to]).toBeDefined();
    }
  });

  it('lets you reach every screen by tapping from S1 Welcome', () => {
    // The floating nav makes all four tab screens reachable from any tab screen.
    const tabIds = screens.filter((s) => s.tab).map((s) => s.id);
    const seen = new Set<ScreenId>(['S1']);
    const queue: ScreenId[] = ['S1'];
    while (queue.length) {
      const id = queue.shift()!;
      const next = allTargets(id).map((a) => a.to);
      if (screensById[id].tab) next.push(...tabIds);
      for (const n of next) {
        if (!seen.has(n)) {
          seen.add(n);
          queue.push(n);
        }
      }
    }
    const unreachable = screens.map((s) => s.id).filter((id) => !seen.has(id));
    expect(unreachable).toEqual([]);
  });

  it('has at most one aqua (primary) button per screen, and none behind the nav', () => {
    for (const s of screens) {
      const primaries = s.actions.filter((a) => a.tone === 'primary').length;
      expect({ id: s.id, primaries }).toEqual({ id: s.id, primaries: s.tab ? 0 : Math.min(primaries, 1) });
    }
  });
});
