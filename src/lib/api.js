import { supabase } from './supabase';

// ── ADVANCES ──────────────────────────────────────────────────────────────────

export async function getAdvances() {
  const { data, error } = await supabase
    .from('advances')
    .select(`*, expenses(*)`)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAdvance(advance) {
  const { expenses, ...adv } = advance;
  const { data, error } = await supabase
    .from('advances')
    .insert([adv])
    .select()
    .single();
  if (error) throw error;
  return { ...data, expenses: [] };
}

export async function updateAdvance(id, advance) {
  const { expenses, ...adv } = advance;
  const { data, error } = await supabase
    .from('advances')
    .update(adv)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAdvance(id) {
  const { error } = await supabase.from('advances').delete().eq('id', id);
  if (error) throw error;
}

// ── EXPENSES ──────────────────────────────────────────────────────────────────

export async function createExpense(expense) {
  const { data, error } = await supabase
    .from('expenses')
    .insert([expense])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// ── TASKS ─────────────────────────────────────────────────────────────────────

export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTask(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(id, task) {
  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

// ── QUOTES ────────────────────────────────────────────────────────────────────

export async function getQuotes() {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createQuote(quote) {
  const { data, error } = await supabase
    .from('quotes')
    .insert([quote])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateQuote(id, quote) {
  const { data, error } = await supabase
    .from('quotes')
    .update(quote)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteQuote(id) {
  const { error } = await supabase.from('quotes').delete().eq('id', id);
  if (error) throw error;
}
