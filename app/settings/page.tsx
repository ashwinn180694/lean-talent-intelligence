'use client';
import AppShellStatic from '@/components/AppShellStatic';
import { supabase } from '@/lib/supabase-browser';
export default function SettingsPage(){ return <AppShellStatic><h1 className="h1">Settings</h1><p className="muted">Account and data tools.</p><div className="card" style={{marginTop:18}}><button className="btn" onClick={async()=>{await supabase.auth.signOut(); window.location.href='/login';}}>Sign out</button></div></AppShellStatic> }
