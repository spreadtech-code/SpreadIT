import fs from 'fs';
import path from 'path';
import { screens, screensById, type ScreenAction, type ScreenId } from './screens';

const appDir = path.join(__dirname, '..', '..', 'app');
const allTargets = (id: ScreenId): ScreenAction[] => {
  const s = screensById[id];
  return [...s.actions, ...(s.links ?? []), ...(s.pretendPush ?? [])];
};

describe('stage 1 screen map (PRD 3.4)', () => {
  it('has exactly S1 to S30, once each', () => {
    expect(screens.map((s) => s.id)).toEqual(
      Array.from({ length: 30 }, (_, i) => `S${i + 1}`),
    );
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
