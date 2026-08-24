# Contoh Pengujian Endpoint `kelana_ai`

Dokumen ini berisi contoh pengujian endpoint API yang ada di project, terutama endpoint update budget:

- `POST /api/v1/trips`
- `GET /api/v1/trips`
- `GET /api/v1/trips/{trip_id}`
- `PUT /api/v1/trips/{trip_id}`
- `DELETE /api/v1/trips/{trip_id}`

## Base URL

Jika server dijalankan secara lokal, gunakan:

```text
http://127.0.0.1:8000
```

## 1. Buat Data Trip Baru

Request:

```http
POST /api/v1/trips
Content-Type: application/json
```

Body:

```json
{
  "destination": "Japan",
  "days": 5,
  "budget": 2000,
  "travel_style": "Cultural"
}
```

Ekspektasi hasil:

- `daily_budget = 2000 / 5 = 400`
- `category = Standard`

Contoh response:

```json
{
  "id": 1,
  "destination": "Japan",
  "days": 5,
  "budget": 2000,
  "travel_style": "Cultural",
  "category": "Standard",
  "daily_budget": 400,
  "ai_recommendation": "Day 1: Explore Tokyo..."
}
```

## 2. Lihat Semua Trip

Request:

```http
GET /api/v1/trips
```

Contoh response:

```json
[
  {
    "id": 1,
    "destination": "Japan",
    "days": 5,
    "budget": 2000,
    "travel_style": "Cultural",
    "category": "Standard",
    "daily_budget": 400,
    "ai_recommendation": "Day 1: Explore Tokyo..."
  }
]
```

## 3. Lihat Detail Trip Berdasarkan ID

Request:

```http
GET /api/v1/trips/1
```

Contoh response:

```json
{
  "id": 1,
  "destination": "Japan",
  "days": 5,
  "budget": 2000,
  "travel_style": "Cultural",
  "category": "Standard",
  "daily_budget": 400,
  "ai_recommendation": "Day 1: Explore Tokyo..."
}
```

## 4. Uji Endpoint Update Budget

Endpoint ini akan memperbarui `budget`, lalu menghitung ulang:

- `category`
- `daily_budget`
- `ai_recommendation`

Request:

```http
PUT /api/v1/trips/1
Content-Type: application/json
```

Body:

```json
{
  "budget": 3500
}
```

Perhitungan baru:

- `budget` baru = `3500`
- `days` lama tetap = `5`
- `daily_budget` baru = `3500 / 5 = 700`
- `category` baru = `Luxury`

Contoh response:

```json
{
  "id": 1,
  "destination": "Japan",
  "days": 5,
  "budget": 3500,
  "travel_style": "Cultural",
  "category": "Luxury",
  "daily_budget": 700,
  "ai_recommendation": "Day 1: Visit premium cultural landmarks..."
}
```

## 5. Uji Kasus Data Tidak Ditemukan

Request:

```http
PUT /api/v1/trips/999
Content-Type: application/json
```

Body:

```json
{
  "budget": 1500
}
```

Contoh response:

```json
{
  "detail": "Trip with id 999 not found"
}
```

Status code yang diharapkan:

```text
404 Not Found
```

## 6. Uji Endpoint Delete Trip

Endpoint ini akan menghapus data trip berdasarkan `id`.

Request:

```http
DELETE /api/v1/trips/1
```

Contoh response:

```json
{
  "message": "Trip with id 1 deleted successfully"
}
```

Status code yang diharapkan:

```text
200 OK
```

## 7. Uji Delete Dengan ID Yang Tidak Ditemukan

Request:

```http
DELETE /api/v1/trips/999
```

Contoh response:

```json
{
  "detail": "Trip with id 999 not found"
}
```

Status code yang diharapkan:

```text
404 Not Found
```

## 8. Skenario Pengujian Singkat

Urutan test yang disarankan:

1. Buat trip baru dengan `POST /api/v1/trips`.
2. Pastikan data berhasil tersimpan dengan `GET /api/v1/trips`.
3. Ambil detail data dengan `GET /api/v1/trips/{trip_id}`.
4. Ubah budget dengan `PUT /api/v1/trips/{trip_id}`.
5. Cek apakah `category` dan `daily_budget` berubah sesuai budget baru.
6. Hapus data dengan `DELETE /api/v1/trips/{trip_id}`.
7. Uji ID yang tidak ada untuk memastikan error `404` berjalan benar.

## 9. Contoh Pengujian di Swagger UI

Jika FastAPI dijalankan lokal, biasanya dokumentasi interaktif bisa dibuka di:

```text
http://127.0.0.1:8000/docs
```

Langkah singkat:

1. Buka `/docs`.
2. Jalankan endpoint `POST` untuk membuat trip.
3. Salin `id` dari response.
4. Jalankan endpoint `PUT` dengan `id` tersebut.
5. Periksa apakah `budget`, `category`, dan `daily_budget` sudah berubah.
6. Jalankan endpoint `DELETE` dengan `id` yang sama.
7. Pastikan data sudah tidak ditemukan lagi saat diakses ulang.
