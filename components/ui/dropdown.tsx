/**
 * Dropdown components — replace long chip rows with compact pill triggers
 * that expand into a scrollable panel of options.
 *
 *   <Dropdown>             — single-select (Course / Stream / Type / Fees)
 *   <MultiSelectDropdown>  — multi-select with an "All" clear-all row (District)
 *
 * The panel is rendered via `position: 'fixed'` and positioned from the
 * trigger's measured bounding rect. This sidesteps any z-index / stacking
 * context / overflow:hidden issues from parent scroll containers — the
 * panel always paints above the viewport, not inside its container.
 *
 * Click-outside closes the panel via a document mousedown listener.
 * Web only — RN native would need a Modal-based variant, deferred.
 */

import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import {
  colors,
  fontFamily,
  fontWeight,
  radius,
  spacing,
} from '@/constants/theme';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface PanelPosition {
  top: number;
  left: number;
  width: number;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Path
        d={open ? 'M3 7.5 L6 4.5 L9 7.5' : 'M3 4.5 L6 7.5 L9 4.5'}
        stroke={colors.textMuted}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Checkmark() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path
        d="M2 7 L5.5 10.5 L12 3.5"
        stroke={colors.primary}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked ? (
        <Svg width={10} height={10} viewBox="0 0 14 14">
          <Path
            d="M2 7 L5.5 10.5 L12 3.5"
            stroke={colors.textInverse}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : null}
    </View>
  );
}

// ───────── Single-select Dropdown ─────────

interface DropdownProps<T extends string> {
  label: string;
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function Dropdown<T extends string>({
  label,
  options,
  value,
  onChange,
}: DropdownProps<T>) {
  const triggerRef = useRef<View>(null);
  const panelRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PanelPosition | null>(null);

  const openPanel = () => {
    const rect = measureTrigger(triggerRef);
    if (rect) setPos(rect);
    setOpen(true);
  };

  useOutsideClick(triggerRef, panelRef, open, () => setOpen(false));
  useReposition(triggerRef, open, setPos);

  const selected = options.find((opt) => opt.value === value);
  const displayLabel = selected?.label ?? '—';

  return (
    <View style={styles.container}>
      <Text variant="label" muted style={styles.label}>
        {label}
      </Text>
      <Pressable
        ref={triggerRef}
        onPress={() => (open ? setOpen(false) : openPanel())}
        style={({ pressed }) => [
          styles.trigger,
          open && styles.triggerOpen,
          pressed && styles.triggerPressed,
        ]}
      >
        <Text style={styles.triggerLabel} numberOfLines={1}>
          {displayLabel}
        </Text>
        <Chevron open={open} />
      </Pressable>

      {open && pos ? (
        <View ref={panelRef} style={[styles.panel, panelStyle(pos)]}>
          <ScrollView
            style={styles.panelScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <Pressable
                  key={String(opt.value)}
                  style={({ pressed }) => [
                    styles.option,
                    pressed && styles.optionPressed,
                    isSelected && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected ? <Checkmark /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

// ───────── Multi-select Dropdown ─────────

interface MultiSelectDropdownProps<T extends string> {
  label: string;
  options: DropdownOption<T>[];
  selected: T[];
  onToggle: (value: T) => void;
  onClear: () => void;
  /** Label for the "All" row at the top, e.g. "All districts". */
  allLabel: string;
  /** How to summarise multiple selections, e.g. "districts". */
  pluralNoun: string;
}

export function MultiSelectDropdown<T extends string>({
  label,
  options,
  selected,
  onToggle,
  onClear,
  allLabel,
  pluralNoun,
}: MultiSelectDropdownProps<T>) {
  const triggerRef = useRef<View>(null);
  const panelRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PanelPosition | null>(null);

  const openPanel = () => {
    const rect = measureTrigger(triggerRef);
    if (rect) setPos(rect);
    setOpen(true);
  };

  useOutsideClick(triggerRef, panelRef, open, () => setOpen(false));
  useReposition(triggerRef, open, setPos);

  // Display label on the trigger:
  //   0 selected → "All districts"
  //   1 selected → "Kollam"
  //   2+ selected → "3 districts"
  let displayLabel = allLabel;
  if (selected.length === 1) {
    displayLabel = options.find((o) => o.value === selected[0])?.label ?? allLabel;
  } else if (selected.length > 1) {
    displayLabel = `${selected.length} ${pluralNoun}`;
  }

  return (
    <View style={styles.container}>
      <Text variant="label" muted style={styles.label}>
        {label}
      </Text>
      <Pressable
        ref={triggerRef}
        onPress={() => (open ? setOpen(false) : openPanel())}
        style={({ pressed }) => [
          styles.trigger,
          open && styles.triggerOpen,
          pressed && styles.triggerPressed,
        ]}
      >
        <Text style={styles.triggerLabel} numberOfLines={1}>
          {displayLabel}
        </Text>
        <Chevron open={open} />
      </Pressable>

      {open && pos ? (
        <View ref={panelRef} style={[styles.panel, panelStyle(pos)]}>
          <ScrollView
            style={styles.panelScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {/* All / clear-all row at the top */}
            <Pressable
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
                selected.length === 0 && styles.optionSelected,
              ]}
              onPress={onClear}
            >
              <Text
                style={[
                  styles.optionLabel,
                  styles.optionLabelBold,
                  selected.length === 0 && styles.optionLabelSelected,
                ]}
              >
                {allLabel}
              </Text>
              {selected.length === 0 ? <Checkmark /> : null}
            </Pressable>
            <View style={styles.optionDivider} />
            {options.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <Pressable
                  key={String(opt.value)}
                  style={({ pressed }) => [
                    styles.option,
                    styles.optionMulti,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => onToggle(opt.value)}
                >
                  <Checkbox checked={isSelected} />
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

// ───────── Helpers ─────────

/** Read the trigger's bounding rect, returning null on native (no DOM). */
function measureTrigger(ref: React.RefObject<View | null>): PanelPosition | null {
  if (typeof window === 'undefined') return null;
  const node = ref.current as unknown as HTMLElement | null;
  if (!node) return null;
  const r = node.getBoundingClientRect();
  return {
    top: r.bottom + 4, // small gap below the trigger
    left: r.left,
    // Panel can be wider than the trigger so labels don't truncate, but
    // never narrower.
    width: Math.max(r.width, 240),
  };
}

/**
 * Closes the dropdown when the user clicks anywhere outside the
 * trigger and panel. Web-only listener.
 */
function useOutsideClick(
  triggerRef: React.RefObject<View | null>,
  panelRef: React.RefObject<View | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;
    if (typeof document === 'undefined') return;
    function handler(e: MouseEvent) {
      const t = triggerRef.current as unknown as HTMLElement | null;
      const p = panelRef.current as unknown as HTMLElement | null;
      const target = e.target as Node;
      if (t && t.contains(target)) return;
      if (p && p.contains(target)) return;
      onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [triggerRef, panelRef, open, onClose]);
}

/**
 * While the panel is open, re-measure on window resize / scroll so the
 * panel stays glued under the trigger as the layout shifts.
 */
function useReposition(
  ref: React.RefObject<View | null>,
  open: boolean,
  setPos: (p: PanelPosition) => void,
) {
  useEffect(() => {
    if (!open) return;
    if (typeof window === 'undefined') return;
    function update() {
      const r = measureTrigger(ref);
      if (r) setPos(r);
    }
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true); // capture phase
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [ref, open, setPos]);
}

function panelStyle(pos: PanelPosition): ViewStyle {
  return {
    position: 'fixed',
    top: pos.top,
    left: pos.left,
    width: pos.width,
  } as ViewStyle;
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    minWidth: 200,
  },
  label: {
    marginBottom: 0,
  },

  // ─── Trigger ───
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    minHeight: 44,
  },
  triggerOpen: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  triggerPressed: {
    opacity: 0.85,
  },
  triggerLabel: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: colors.text,
    flex: 1,
  },

  // ─── Panel ───
  panel: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
    zIndex: 9999,
    overflow: 'hidden',
  },
  panelScroll: {
    maxHeight: 320,
  },

  // ─── Option rows ───
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  optionMulti: {
    justifyContent: 'flex-start',
  },
  optionPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  optionLabelBold: {
    fontFamily: fontFamily.displaySemibold,
  },
  optionLabelSelected: {
    color: colors.primaryDark,
  },
  optionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 0,
  },

  // ─── Checkbox glyph for multi-select rows ───
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
