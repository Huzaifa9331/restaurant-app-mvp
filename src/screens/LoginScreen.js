// Q3 + Q6 + Q9: Login/Signup. useState for UI state, useForm for the fields, useAuth for the session.
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockUsers } from '../data/users';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useForm from '../hooks/useForm';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emptyForm = { fullName: '', email: '', password: '', confirmPassword: '', role: 'customer' };

const validateForm = (v, isSignup) => {
  const e = {};
  if (isSignup && !v.fullName.trim()) e.fullName = 'Full name is required';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address';
  if (v.password.length < 8 || !/\d/.test(v.password)) e.password = 'Password needs 8+ characters and at least one digit';
  if (isSignup && v.confirmPassword !== v.password) e.confirmPassword = 'Passwords do not match';
  return e;
};

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignup = mode === 'signup';

  const { values, errors, handleChange, handleSubmit, reset } = useForm(emptyForm, (v) => validateForm(v, isSignup));

  const switchMode = () => { setMode(isSignup ? 'login' : 'signup'); reset(); };

  const submit = handleSubmit((v) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const email = v.email.trim().toLowerCase();
      const existing = mockUsers.find((u) => u.email.toLowerCase() === email);
      if (isSignup) {
        if (existing) {
          setIsSubmitting(false);
          Alert.alert('Signup failed', 'An account with this email already exists.');
          return;
        }
        const newUser = { id: 'u' + (mockUsers.length + 1), fullName: v.fullName.trim(), email, password: v.password, role: v.role };
        mockUsers.push(newUser);
        setIsSubmitting(false);
        login(newUser);
      } else if (!existing || existing.password !== v.password) {
        setIsSubmitting(false);
        Alert.alert('Login failed', 'Incorrect email or password.');
      } else {
        setIsSubmitting(false);
        login(existing); // stored in AuthContext; the navigator switches to the tabs
      }
    }, 1000);
  });

  const field = (name, label, extra = {}) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, errors[name] && styles.inputError]}
        value={values[name]}
        onChangeText={(t) => handleChange(name, t)}
        autoCapitalize="none"
        editable={!isSubmitting}
        placeholderTextColor={colors.subtext}
        {...extra}
      />
      {errors[name] ? <Text style={styles.error}>{errors[name]}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{isSignup ? 'Create your account' : 'Welcome back'}</Text>
          <Text style={styles.subtitle}>{isSignup ? 'Sign up to order food and book tables.' : "Log in to see today's menu."}</Text>

          {isSignup && field('fullName', 'Full name', { autoCapitalize: 'words' })}
          {field('email', 'Email', { keyboardType: 'email-address' })}
          {field('password', 'Password', { secureTextEntry: !showPassword })}
          {isSignup && field('confirmPassword', 'Confirm password', { secureTextEntry: !showPassword })}

          <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
            <Text style={styles.link}>{showPassword ? 'Hide password' : 'Show password'}</Text>
          </TouchableOpacity>

          {isSignup && (
            <View style={styles.field}>
              <Text style={styles.label}>I am a</Text>
              <View style={styles.roleRow}>
                {['customer', 'manager'].map((r) => (
                  <TouchableOpacity key={r} style={[styles.roleBtn, values.role === r && styles.roleBtnActive]}
                    onPress={() => handleChange('role', r)} disabled={isSubmitting}>
                    <Text style={[styles.roleText, values.role === r && styles.roleTextActive]}>{r === 'customer' ? 'Customer' : 'Manager'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={[styles.button, isSubmitting && { opacity: 0.6 }]} onPress={submit} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.buttonText}>{isSignup ? 'Create account' : 'Log in'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={switchMode} disabled={isSubmitting}>
            <Text style={[styles.link, { textAlign: 'center', marginTop: 20 }]}>{isSignup ? 'Already have an account? Log in' : 'New here? Create an account'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: c.bg },
  container: { padding: 24, paddingTop: 48 },
  title: { fontSize: 28, fontWeight: '700', color: c.text },
  subtitle: { fontSize: 15, color: c.subtext, marginTop: 6, marginBottom: 28 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: c.border, backgroundColor: c.card, color: c.text, borderRadius: 10, padding: 12, fontSize: 16 },
  inputError: { borderColor: c.danger },
  error: { color: c.danger, fontSize: 13, marginTop: 4 },
  link: { color: c.primary, fontSize: 14, fontWeight: '600', marginBottom: 20 },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: c.border, alignItems: 'center', backgroundColor: c.card },
  roleBtnActive: { backgroundColor: c.primary, borderColor: c.primary },
  roleText: { color: c.text, fontWeight: '600' },
  roleTextActive: { color: c.onPrimary },
  button: { backgroundColor: c.primary, padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: c.onPrimary, fontSize: 16, fontWeight: '700' },
});
