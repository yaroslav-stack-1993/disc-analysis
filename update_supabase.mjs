const SUPABASE_URL = 'https://uetzaqqtfwgqytggvpct.supabase.co/rest/v1/disc_tests';
const API_KEY = 'sb_publishable_f4Yz_Xr7vCf6yKyUUB1lVA_XXIvJMOu';

const headers = {
    'apikey': API_KEY,
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

async function run() {
    console.log("Fetching old records...");
    const res = await fetch(SUPABASE_URL + '?select=*', { headers });
    const records = await res.json();
    
    if (!Array.isArray(records)) {
        console.error("Error fetching records:", records);
        return;
    }

    let updatedCount = 0;
    for (let record of records) {
        if (!record.primary_type.includes('#')) {
            const mainType = record.primary_type || 'D';
            // В качестве вторичного возьмем соседний тип, чтобы получился смешанный профиль
            const secType = record.secondary_type || (mainType === 'I' ? 'S' : (mainType === 'D' ? 'C' : (mainType === 'S' ? 'I' : 'D')));
            
            // Синтетический счет Маски (адаптация)
            // Даем первому 28 баллов, второму 18, остальным 7
            let scoresMost = { D: 7, I: 7, S: 7, C: 7 };
            scoresMost[mainType] += 21; // 28
            if (mainType !== secType) {
                scoresMost[secType] += 11; // 18
            }
            
            let maskStr = `${mainType}/${secType}#${scoresMost.D},${scoresMost.I},${scoresMost.S},${scoresMost.C}`;

            // Синтетический счет Стресса (естественный)
            // В стрессе: lowest = main, second lowest = sec.
            // Значит остальные должны быть большими (отвергаемыми).
            let scoresLeast = { D: 22, I: 22, S: 22, C: 22 };
            scoresLeast[mainType] = 4; // Реже всего выбирает "Не мое"
            scoresLeast[secType] += 7; // Чуть чаще
            
            // Но мы сохраняем строку как Main/Sec
            let stressStr = `${mainType}/${secType}#${scoresLeast.D},${scoresLeast.I},${scoresLeast.S},${scoresLeast.C}`;

            console.log(`Updating record ${record.id} (${record.name})...`);
            
            const p = await fetch(`${SUPABASE_URL}?id=eq.${record.id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    primary_type: maskStr,
                    secondary_type: stressStr
                })
            });
            const updateRes = await p.json();
            console.log(updateRes);
            updatedCount++;
        }
    }
    console.log(`Updated ${updatedCount} old records successfully.`);
}

run();
