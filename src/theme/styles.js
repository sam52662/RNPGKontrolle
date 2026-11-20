import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FAFFF8',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonAccent: {
    backgroundColor: colors.accent,
  },
  buttonAccentText: {
    color: colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
