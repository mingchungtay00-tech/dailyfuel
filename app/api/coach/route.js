export const runtime="nodejs";
const rules={
next:"Give one practical next-meal direction based on today's remaining calories/macros. Keep it short. You may suggest common foods, preferably using provided saved-food names when useful.",
dinner:"Use ONLY the provided ingredients. Recommend practical amounts for dinner that fit the remaining daily calories/macros as closely as reasonable. Do not invent ingredients.",
can:"Assess the one provided saved food. Say whether it fits well, should be limited, or is better avoided today. Give a suggested amount using its provided nutrition basis.",
avoid:"Based only on today's logged intake and remaining targets, identify at most 3 food categories or choices to limit today. Avoid generic advice.",
build:"Use ONLY the provided ingredients. Build one practical meal for the requested meal type and goal. Give gram/serving amounts and stay within remaining calories when possible."
};
export async function POST(req){try{
 const key=process.env.GEMINI_API_KEY;if(!key)return Response.json({error:"GEMINI_API_KEY is not configured."},{status:503});
 const{question,context,ingredients=[],goal="balanced",meal="Dinner",language="en",presetNames=[]}=await req.json();
 if(!rules[question])return Response.json({error:"Unsupported Coach question."},{status:400});
 const lang=language==="zh"?"Simplified Chinese":"English";
 const shape='{"status":"fits|limit|avoid|neutral","title":"short string","summary":"1-2 short sentences","items":[{"name":"string","amount":number|null,"unit":"string|null","calories":number|null,"protein":number|null,"carbs":number|null,"fat":number|null,"reason":"short string|null"}],"estimatedMeal":{"calories":number,"protein":number,"carbs":number,"fat":number}|null,"estimatedDayTotal":{"calories":number,"protein":number,"carbs":number,"fat":number}|null,"notes":["short string"]}';
 const prompt=`You are the AI Coach inside a calorie and macro tracking app. This is temporary guidance, not medical advice. Do not diagnose. Use the user's recorded data, do not claim precision beyond the data provided. Reply in ${lang}. Keep the answer concise and practical. ${rules[question]} Return JSON ONLY in this exact general shape: ${shape}. If a field is not relevant, use null or an empty array. For dinner/build, calculate nutrition from the provided ingredient basis and suggested amounts. Context: ${JSON.stringify(context)} Ingredients: ${JSON.stringify(ingredients)} Requested goal: ${goal}. Requested meal: ${meal}. Saved food names available: ${JSON.stringify(presetNames)}`;
 const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",{method:"POST",headers:{"x-goog-api-key":key,"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:"application/json"}})});
 const j=await r.json();if(!r.ok)throw new Error(j.error?.message||"Gemini request failed");
 const raw=(j.candidates?.[0]?.content?.parts||[]).map(p=>p.text||"").join("").replace(/^\`\`\`json\s*/i,"").replace(/\`\`\`$/,"").trim();
 return Response.json(JSON.parse(raw));
}catch(e){return Response.json({error:e.message||"AI Coach failed"},{status:500})}}