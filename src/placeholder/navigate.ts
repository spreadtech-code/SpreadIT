// TEMPORARY (stage 1): moves between placeholder screens following PRD 3.4.
import type { useRouter } from 'expo-router';
import { screensById, type ScreenAction } from './screens';

export function followAction(router: ReturnType<typeof useRouter>, action: ScreenAction): void {
  const target = screensById[action.to];
  const mode = action.mode ?? (target.tab ? 'tab' : 'push');

  if (mode === 'back' && router.canGoBack()) {
    router.back();
    return;
  }
  if (mode === 'reset') {
    if (router.canDismiss()) router.dismissAll();
    router.replace(target.route);
    return;
  }
  if (mode === 'tab' || target.tab) {
    router.dismissTo(target.route);
    return;
  }
  router.push(target.route);
}
