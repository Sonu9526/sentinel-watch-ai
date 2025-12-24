import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calculate Shannon entropy of data
function calculateEntropy(data: Uint8Array): number {
  const freq = new Map<number, number>();
  for (const byte of data) {
    freq.set(byte, (freq.get(byte) || 0) + 1);
  }

  let entropy = 0;
  const len = data.length;
  for (const count of freq.values()) {
    const p = count / len;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

// Simulated ML model for ransomware detection
function runMLPrediction(features: {
  entropy: number;
  fileSize: number;
  extension: string;
}): { status: 'normal' | 'suspicious' | 'ransomware'; riskScore: number; confidence: number } {
  let riskScore = 0;

  // High entropy is suspicious (encrypted files have entropy ~8)
  if (features.entropy > 7.5) {
    riskScore += 40;
  } else if (features.entropy > 6.5) {
    riskScore += 20;
  } else if (features.entropy > 5.5) {
    riskScore += 10;
  }

  // Known ransomware extensions
  const dangerousExtensions = ['.encrypted', '.locked', '.crypto', '.crypt', '.enc', '.locky', '.wcry', '.wncry'];
  const suspiciousExtensions = ['.exe', '.dll', '.scr', '.bat', '.cmd', '.vbs', '.js', '.ps1'];

  const ext = features.extension.toLowerCase();
  if (dangerousExtensions.includes(ext)) {
    riskScore += 50;
  } else if (suspiciousExtensions.includes(ext)) {
    riskScore += 20;
  }

  // Very small or very large files can be suspicious
  if (features.fileSize < 100) {
    riskScore += 5;
  } else if (features.fileSize > 100 * 1024 * 1024) {
    riskScore += 10;
  }

  // Simulate some behavioral features for academic demo
  // Pseudo-deterministic simulation based on file properties for consistent demo results
  const nameHash = features.extension.length + features.fileSize;
  const simulatedModificationRate = (nameHash % 50);
  const simulatedRenameCount = (nameHash % 3);

  if (simulatedModificationRate > 30) {
    riskScore += 15;
  }
  if (simulatedRenameCount > 1) {
    riskScore += 10;
  }

  // Normalize risk score
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Determine status
  let status: 'normal' | 'suspicious' | 'ransomware';
  if (riskScore >= 70) {
    status = 'ransomware';
  } else if (riskScore >= 40) {
    status = 'suspicious';
  } else {
    status = 'normal';
  }

  // Confidence based on how clear-cut the features are
  const confidence = 0.75 + (Math.abs(riskScore - 50) / 200);

  return { status, riskScore, confidence: Math.min(0.99, confidence) };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Get the authorization header to verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create client with user's token to verify auth
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Read file data for analysis (do NOT execute)
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Extract features
    const entropy = calculateEntropy(fileData);
    const fileSize = file.size;
    const extension = '.' + (file.name.split('.').pop() || 'unknown');

    console.log(`Features - Entropy: ${entropy.toFixed(4)}, Size: ${fileSize}, Extension: ${extension}`);

    // Run ML prediction
    const prediction = runMLPrediction({ entropy, fileSize, extension });

    console.log(`Prediction - Status: ${prediction.status}, Risk: ${prediction.riskScore}, Confidence: ${prediction.confidence}`);

    // Use service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Store the file safely (optional, for audit purposes)
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('manual-scans')
      .upload(filePath, fileData, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      // Continue even if upload fails - the scan result is more important
    }

    // Store detection result
    const { data: detectionResult, error: insertError } = await supabaseAdmin
      .from('detection_results')
      .insert({
        status: prediction.status,
        risk_score: prediction.riskScore,
        confidence: prediction.confidence,
        model_version: 'v1.0.0-manual',
        scan_type: 'manual',
        original_filename: file.name,
        file_size: fileSize,
        file_extension: extension,
        entropy: entropy,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to store scan result' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate alert if risk is high
    if (prediction.riskScore >= 50) {
      const severity = prediction.riskScore >= 80 ? 'critical' : prediction.riskScore >= 60 ? 'high' : 'medium';

      await supabaseAdmin
        .from('alerts')
        .insert({
          detection_result_id: detectionResult.id,
          severity: severity,
          title: `Manual Scan Alert: ${file.name}`,
          description: `Uploaded file "${file.name}" was classified as ${prediction.status} with risk score ${prediction.riskScore}%. Entropy: ${entropy.toFixed(2)}, Size: ${fileSize} bytes.`,
        });

      console.log(`Alert generated: ${severity} for ${file.name}`);
    }

    return new Response(JSON.stringify({
      success: true,
      result: {
        id: detectionResult.id,
        filename: file.name,
        status: prediction.status,
        riskScore: prediction.riskScore,
        confidence: prediction.confidence,
        entropy: entropy,
        fileSize: fileSize,
        extension: extension,
        timestamp: detectionResult.created_at,
        alertGenerated: prediction.riskScore >= 50,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Manual scan error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
