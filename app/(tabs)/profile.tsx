import {
  useCallback,
  useState,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  Pressable,
} from 'react-native';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import {
  useAuth,
  signOut,
} from '@/lib/auth';

import {
  getProfile,
  updateProfile,
  type Profile,
} from '@/lib/profiles';

export default function ProfileScreen() {
  const { user } = useAuth();

  const [loading, setLoading] =
    useState(false);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [draftName, setDraftName] =
    useState('');

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const router = useRouter();

  /* ---------------- LOAD PROFILE ---------------- */

  const loadProfile = useCallback(
    async () => {
      if (!user) return;

      try {
        const p =
          await getProfile(user.id);

        setProfile(p);

        setDraftName(
          p?.full_name ||
            user.user_metadata
              ?.full_name ||
            ''
        );
      } catch (error) {
        console.error(
          'Error loading profile:',
          error
        );

        setDraftName(
          user.user_metadata
            ?.full_name || ''
        );
      }
    },
    [user]
  );

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  /* ---------------- SAVE NAME ---------------- */

  const handleSaveName = async () => {
    if (!user) return;

    const name =
      draftName.trim();

    if (!name) {
      Alert.alert(
        'Invalid Name',
        'Please enter your full name.'
      );

      return;
    }

    setSaving(true);

    try {
      const { error } =
        await updateProfile(
          user.id,
          {
            full_name: name,
          }
        );

      if (error) {
        Alert.alert(
          'Error',
          error
        );

        return;
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: name,
            }
          : prev
      );

      setDraftName(name);
      setEditing(false);

      Alert.alert(
        'Saved',
        'Your name has been updated.'
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message ||
          'Unable to save your name.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- SIGN OUT ---------------- */

  const handleSignOut = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const { error } =
        await signOut();

      if (error) {
        Alert.alert(
          'Sign Out Failed',
          error
        );

        return;
      }

      router.replace('/login');
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.message ||
          'Failed to sign out.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ROLE ---------------- */

  const role =
    profile?.role ||
    user?.user_metadata?.role ||
    null;

  /* ---------------- NAME ---------------- */

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    '';

  /* ---------------- EMAIL ---------------- */

  const displayEmail =
    profile?.email ||
    user?.email ||
    'No email';

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>
          My Profile
        </Text>

        <Text style={styles.subtitle}>
          Manage your account information
        </Text>
      </View>

      {user && (
        <View style={styles.card}>

          {/* ACCOUNT ICON + TITLE */}

          <View
            style={styles.accountHeader}
          >
            <View
              style={styles.avatar}
            >
              <Text
                style={styles.avatarText}
              >
                {displayName
                  ? displayName
                      .charAt(0)
                      .toUpperCase()
                  : 'U'}
              </Text>
            </View>

            <View
              style={styles.accountInfo}
            >
              <Text
                style={styles.accountTitle}
              >
                Account Information
              </Text>

              <Text
                style={styles.accountSubtitle}
              >
                Your registered details
              </Text>
            </View>
          </View>

          {/* ROLE */}

          <View
            style={styles.fieldSection}
          >
            <Text
              style={styles.label}
            >
              Role
            </Text>

            <View
              style={[
                styles.roleBadge,
                role === 'teacher'
                  ? styles.teacherBadge
                  : styles.studentBadge,
              ]}
            >
              <Text
                style={
                  styles.roleBadgeText
                }
              >
                {role === 'teacher'
                  ? 'Teacher'
                  : role === 'student'
                  ? 'Student'
                  : 'Role Not Assigned'}
              </Text>
            </View>
          </View>

          {/* DIVIDER */}

          <View
            style={styles.divider}
          />

          {/* FULL NAME */}

          <View
            style={styles.fieldSection}
          >
            <Text
              style={styles.label}
            >
              Full Name
            </Text>

            {editing ? (
              <View>
                <TextInput
                  value={draftName}
                  onChangeText={
                    setDraftName
                  }
                  style={
                    styles.nameInput
                  }
                  placeholder="Enter your full name"
                  placeholderTextColor={
                    COLORS.textSecondary
                  }
                  autoCapitalize="words"
                  editable={!saving}
                />

                <View
                  style={
                    styles.editButtonRow
                  }
                >
                  <Pressable
                    onPress={
                      handleSaveName
                    }
                    disabled={saving}
                    style={[
                      styles.saveButton,
                      saving &&
                        styles.disabledButton,
                    ]}
                  >
                    <Text
                      style={
                        styles.saveButtonText
                      }
                    >
                      {saving
                        ? 'Saving...'
                        : 'Save'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      setEditing(false)
                    }
                    disabled={saving}
                    style={
                      styles.cancelButton
                    }
                  >
                    <Text
                      style={
                        styles.cancelButtonText
                      }
                    >
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() =>
                  setEditing(true)
                }
                style={
                  styles.nameDisplay
                }
              >
                <Text
                  style={[
                    styles.value,
                    !displayName &&
                      styles.placeholderText,
                  ]}
                  numberOfLines={1}
                >
                  {displayName ||
                    'Tap to add your name'}
                </Text>

                <Text
                  style={styles.editText}
                >
                  Edit
                </Text>
              </Pressable>
            )}
          </View>

          {/* EMAIL */}

          <View
            style={styles.fieldSection}
          >
            <Text
              style={styles.label}
            >
              Email
            </Text>

            <View
              style={styles.readOnlyField}
            >
              <Text
                style={styles.value}
                numberOfLines={1}
              >
                {displayEmail}
              </Text>
            </View>
          </View>

          {/* USER ID */}

          <View
            style={styles.fieldSection}
          >
            <Text
              style={styles.label}
            >
              User ID
            </Text>

            <View
              style={styles.readOnlyField}
            >
              <Text
                style={styles.idValue}
                numberOfLines={1}
              >
                {profile?.id ||
                  user.id}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* SIGN OUT */}

      <View
        style={styles.signOutContainer}
      >
        <AppButton
          title={
            loading
              ? 'Signing out...'
              : 'Sign Out'
          }
          icon="log-out-outline"
          onPress={handleSignOut}
        />

        <Text
          style={styles.signOutHint}
        >
        
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    justifyContent: 'space-between',
  },

  /* HEADER */

  header: {
    marginBottom: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
    marginTop: 20,
    textAlign: 'center'
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },

  /* CARD */

card: {
  backgroundColor: COLORS.card,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: COLORS.border,
  padding: 17,
},

  /* ACCOUNT HEADER */

  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor:
      COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: COLORS.textOnPrimary,
    fontSize: 20,
    fontWeight: '700',
  },

  accountInfo: {
    flex: 1,
  },

  accountTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  accountSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  /* FIELDS */

  fieldSection: {
    marginBottom: 12,
  },

  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  value: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  placeholderText: {
    color: COLORS.textSecondary,
  },

  readOnlyField: {
    minHeight: 39,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
  },

  idValue: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },

  /* ROLE */

  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 6,
  },

  teacherBadge: {
    backgroundColor:
      COLORS.primary,
  },

  studentBadge: {
    backgroundColor:
      COLORS.textSecondary,
  },

  roleBadgeText: {
    color: COLORS.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
  },

  /* DIVIDER */

  divider: {
    height: 1,
    backgroundColor:
      COLORS.border,
    marginBottom: 12,
  },

  /* NAME */

  nameDisplay: {
    minHeight: 39,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
  },

  editText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },

  /* EDIT */

  nameInput: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    color: COLORS.textPrimary,
    backgroundColor:
      COLORS.background,
    fontSize: 14,
  },

  editButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 7,
  },

  saveButton: {
    flex: 1,
    backgroundColor:
      COLORS.primary,
    borderRadius: 9,
    paddingVertical: 8,
    alignItems: 'center',
  },

  saveButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },

  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    paddingVertical: 8,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

  disabledButton: {
    opacity: 0.5,
  },

  /* SIGN OUT */

  signOutContainer: {
    marginTop: 14,
  },

  signOutHint: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
});