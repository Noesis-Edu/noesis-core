import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttentionTracker } from '../attention';

describe('AttentionTracker webcam option', () => {
  let getUserMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getUserMediaMock = vi.fn();
    (globalThis as any).navigator = {
      mediaDevices: { getUserMedia: getUserMediaMock },
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not request webcam when disabled', async () => {
    const tracker = new AttentionTracker({ webcam: false });
    await tracker.startTracking(null);
    expect(getUserMediaMock).not.toHaveBeenCalled();
  });
});
