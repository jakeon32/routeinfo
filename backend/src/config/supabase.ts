import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error(`Supabase Configuration Missing. URL: ${supabaseUrl ? 'Set' : 'Missing'}, Key: ${supabaseKey ? 'Set' : 'Missing'}`);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
