import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const API = 'https://crud-produtos-backend-72mh.onrender.com/produtos';
const blank = { nome: '', categoria: '', preco: '', quantidade: '' };
async function api(path = '', options = {}) {
  const response = await fetch(API + path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Error(body.mensagem || 'Erro HTTP ' + response.status);
  return body;
}
export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState('list');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function refresh() {
    setLoading(true); setError('');
    try { const result = await api(); if (!Array.isArray(result)) throw Error('Resposta inesperada da API'); setProducts(result); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);
  function start(item) {
    setEditing(item?._id || null);
    setForm(item ? { nome: item.nome, categoria: item.categoria, preco: String(item.preco), quantidade: String(item.quantidade) } : blank);
    setPage('form');
  }
  async function save() {
    const preco = Number(form.preco.replace(',', '.')), quantidade = Number(form.quantidade);
    if (!form.nome.trim() || !form.categoria.trim() || !form.preco.trim() || !form.quantidade.trim() || !Number.isFinite(preco) || preco < 0 || !Number.isInteger(quantidade) || quantidade < 0) {
      Alert.alert('Dados inválidos', 'Informe nome, categoria, preço válido e quantidade inteira não negativa.'); return;
    }
    setSaving(true);
    try {
      await api(editing ? '/' + editing : '', { method: editing ? 'PUT' : 'POST', body: JSON.stringify({ nome: form.nome.trim(), categoria: form.categoria.trim(), preco, quantidade }) });
      setPage('list'); setEditing(null); setForm(blank); await refresh();
    } catch (e) { Alert.alert('Erro ao salvar', e.message); }
    finally { setSaving(false); }
  }
  function remove(product) {
    Alert.alert('Excluir produto', 'Excluir ' + product.nome + '?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try { await api('/' + product._id, { method: 'DELETE' }); await refresh(); }
        catch (e) { Alert.alert('Erro ao excluir', e.message); }
      } }
    ]);
  }
  const Button = ({ label, onPress, secondary, danger, disabled }) => (
    <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button, secondary && styles.secondary, danger && styles.danger, disabled && { opacity: .5 }]}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
  return <SafeAreaView style={styles.root}><StatusBar style="light" />
    <View style={styles.header}><Text style={styles.eyebrow}>CONTROLE DE ESTOQUE</Text><Text style={styles.title}>{page === 'list' ? 'Meus produtos' : editing ? 'Editar produto' : 'Novo produto'}</Text><Text style={styles.subtitle}>CRUD Mobile • React Native + MongoDB</Text></View>
    {page === 'list' ? <View style={styles.main}>
      <View style={styles.row}><Text style={styles.muted}>{products.length} produto(s)</Text><Button label="Atualizar" secondary onPress={refresh} /></View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator color="#a855f7" size="large" /> : <FlatList data={products} keyExtractor={item => item._id} contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={<Text style={styles.muted}>Nenhum produto cadastrado.</Text>}
        renderItem={({ item }) => <View style={styles.card}>
          <Text style={styles.name}>{item.nome}</Text><Text style={styles.muted}>{item.categoria} • Estoque: {item.quantidade}</Text>
          <Text style={styles.price}>R$ {Number(item.preco).toFixed(2).replace('.', ',')}</Text>
          <View style={styles.row}><Button label="Editar" secondary onPress={() => start(item)} /><Button label="Excluir" danger onPress={() => remove(item)} /></View>
        </View>} />}
      <Button label="+ Cadastrar produto" onPress={() => start(null)} />
    </View> : <ScrollView style={styles.main} contentContainerStyle={{ paddingTop: 24 }}>
      {[[ 'nome', 'Nome' ], [ 'categoria', 'Categoria' ], [ 'preco', 'Preço (R$)' ], [ 'quantidade', 'Quantidade' ]].map(([key, label]) =>
        <View key={key} style={styles.field}><Text style={styles.label}>{label}</Text><TextInput style={styles.input} placeholder={label} placeholderTextColor="#999" value={form[key]} onChangeText={value => setForm(old => ({ ...old, [key]: value }))} keyboardType={key === 'preco' ? 'decimal-pad' : key === 'quantidade' ? 'number-pad' : 'default'} /></View>)}
      <Button label={saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar'} disabled={saving} onPress={save} />
      <Button label="Cancelar" secondary onPress={() => setPage('list')} />
    </ScrollView>}
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#12121c' }, header: { backgroundColor: '#261535', padding: 24, paddingTop: 48 },
  eyebrow: { color: '#c084fc', fontSize: 12, fontWeight: '800', letterSpacing: 2 }, title: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#c9b7d5', marginTop: 5 }, main: { flex: 1, padding: 18 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  muted: { color: '#b8b3c4' }, error: { color: '#ff9999', marginBottom: 12 }, card: { backgroundColor: '#222233', borderRadius: 16, padding: 18, marginBottom: 12 },
  name: { color: '#fff', fontSize: 19, fontWeight: '800' }, price: { color: '#d8b4fe', fontSize: 21, fontWeight: '800', marginVertical: 12 },
  button: { backgroundColor: '#9333ea', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center', marginVertical: 5 },
  secondary: { backgroundColor: '#52336d' }, danger: { backgroundColor: '#762d44' }, buttonText: { color: '#fff', fontWeight: '800' },
  field: { marginBottom: 18 }, label: { color: '#e9ddf3', marginBottom: 8, fontWeight: '700' },
  input: { backgroundColor: '#29293a', color: '#fff', padding: 15, borderRadius: 10, fontSize: 16 }
});
