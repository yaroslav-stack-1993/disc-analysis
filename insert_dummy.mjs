const SUPABASE_URL = 'https://uetzaqqtfwgqytggvpct.supabase.co/rest/v1/disc_tests';
const API_KEY = 'sb_publishable_f4Yz_Xr7vCf6yKyUUB1lVA_XXIvJMOu';

const headers = {
    'apikey': API_KEY,
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

async function insertDummy() {
    const dummyUser = {
        name: "Пользователь (Демо I/D)",
        role: "Тест смешанного профиля",
        // Создаем реалистичный сдвиг: Маска I/D, Стресс D/C
        // Сырые баллы Маски (сумма 60 выборов): I=32, D=16, S=8, C=4
        primary_type: "I/D#16,32,8,4",
        // Сырые баллы Стресса (сумма 60 выборов):
        // D реже всего "Не мое" (lowest), C второй с конца
        // Набираем 60: D=5 (не отвергает), C=10 (не отвергает), S=20 (отвергает), I=25 (сильно отвергает)
        secondary_type: "D/C#5,25,20,10"
    };

    console.log("Inserting dummy user...");
    const res = await fetch(SUPABASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(dummyUser)
    });

    if (res.ok) {
        console.log("Successfully inserted demo user!");
    } else {
        const err = await res.text();
        console.error("Failed to insert:", err);
    }

    const dummyUser2 = {
        name: "Пользователь (Чистый I)",
        role: "Тест чистого профиля",
        // Маска I, вторичного нет (D=10, что меньше порога)
        primary_type: "I#10,40,6,4",
        secondary_type: "I#10,40,6,4"
    };

    console.log("Inserting dummy pure user...");
    const res2 = await fetch(SUPABASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(dummyUser2)
    });

    if (res2.ok) {
        console.log("Successfully inserted pure user!");
    }
}

insertDummy();
