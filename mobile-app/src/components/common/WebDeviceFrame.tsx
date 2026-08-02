/**
 * WebDeviceFrame — Android phone mockup wrapper (web only).
 * Native platforms render children full-screen unchanged.
 */

import React, { useEffect, type ReactNode } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { colors } from '../../theme';

const FRAME_MAX_W = 412;
const FRAME_MAX_H = 850;
const FRAME_RADIUS = 40;
const BEZEL = 10;

type Props = { children: ReactNode };

export function WebDeviceFrame({ children }: Props) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }
  return <WebOnlyFrame>{children}</WebOnlyFrame>;
}

function WebOnlyFrame({ children }: Props) {
  const { width: winW, height: winH } = useWindowDimensions();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const id = 'babygrow-web-device-frame-css';
    if (document.getElementById(id)) return;

    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
      html, body, #root {
        height: 100%;
        margin: 0;
        overflow: hidden;
        background: #0f172a;
      }
      .babygrow-phone-screen,
      .babygrow-phone-screen * {
        scrollbar-width: thin;
        scrollbar-color: rgba(182, 0, 89, 0.35) transparent;
      }
      .babygrow-phone-screen::-webkit-scrollbar,
      .babygrow-phone-screen *::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      .babygrow-phone-screen::-webkit-scrollbar-thumb,
      .babygrow-phone-screen *::-webkit-scrollbar-thumb {
        background: rgba(182, 0, 89, 0.4);
        border-radius: 4px;
      }
      .babygrow-phone-screen::-webkit-scrollbar-track,
      .babygrow-phone-screen *::-webkit-scrollbar-track {
        background: transparent;
      }
    `;
    document.head.appendChild(el);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  const pad = 32;
  const availW = Math.max(280, winW - pad * 2);
  const availH = Math.max(480, winH - pad * 2);
  const scale = Math.min(1, availW / FRAME_MAX_W, availH / FRAME_MAX_H);
  const frameW = Math.round(FRAME_MAX_W * scale);
  const frameH = Math.round(FRAME_MAX_H * scale);
  const outerR = FRAME_RADIUS * scale;
  const innerR = Math.max(24, (FRAME_RADIUS - BEZEL) * scale);
  const bezelPad = Math.max(6, BEZEL * scale);

  return (
    <View style={styles.stage} accessibilityLabel="BabyGrow web device preview">
      <View style={styles.gridOverlay} pointerEvents="none" />
      <View style={styles.glow} pointerEvents="none" />

      <Text style={styles.brandHint}>BabyGrow</Text>
      <Text style={styles.subHint}>
        Android preview · {frameW}×{frameH}
      </Text>

      <View style={[styles.deviceShell, { width: frameW, height: frameH, borderRadius: outerR }]}>
        <View style={[styles.bezel, { borderRadius: outerR, padding: bezelPad }]}>
          <View
            {...({ className: 'babygrow-phone-screen' } as object)}
            style={[styles.screen, { borderRadius: innerR }]}
          >
            <View style={styles.punchRow} pointerEvents="none">
              <View style={styles.punchHole}>
                <View style={styles.punchInner} />
              </View>
            </View>
            <View style={styles.appRoot}>{children}</View>
          </View>
        </View>

        <View
          style={[styles.sideBtn, styles.powerBtn, { top: frameH * 0.22 }]}
          pointerEvents="none"
        />
        <View
          style={[styles.sideBtn, styles.volBtn, { top: frameH * 0.32 }]}
          pointerEvents="none"
        />
        <View
          style={[styles.sideBtn, styles.volBtn, { top: frameH * 0.4 }]}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 24,
    paddingHorizontal: 16,
    ...Platform.select({
      web: {
        minHeight: '100vh' as unknown as number,
        backgroundImage:
          'radial-gradient(ellipse 80% 60% at 50% 40%, #1e293b 0%, #0f172a 55%, #020617 100%)',
      } as object,
      default: {},
    }),
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
    ...Platform.select({
      web: {
        backgroundImage:
          'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      } as object,
      default: {},
    }),
  },
  glow: {
    position: 'absolute',
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: 'rgba(182, 0, 89, 0.12)',
    ...Platform.select({
      web: { filter: 'blur(60px)' } as object,
      default: {},
    }),
  },
  brandHint: {
    position: 'absolute',
    top: 20,
    left: 28,
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
    opacity: 0.9,
  },
  subHint: {
    position: 'absolute',
    top: 46,
    left: 28,
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  deviceShell: {
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow:
          '0 40px 80px rgba(0,0,0,0.55), 0 12px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)',
      } as object,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.45,
        shadowRadius: 40,
        shadowOffset: { width: 0, height: 24 },
        elevation: 24,
      },
    }),
  },
  bezel: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background.default,
    overflow: 'hidden',
    position: 'relative',
  },
  punchRow: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: 'center',
  },
  punchHole: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  punchInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#334155',
  },
  appRoot: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  sideBtn: {
    position: 'absolute',
    width: 3,
    backgroundColor: '#475569',
  },
  powerBtn: {
    right: -3,
    height: 48,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  volBtn: {
    left: -3,
    height: 36,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
});

export default WebDeviceFrame;
