# ReLoop Database

## Tech Stack
- **MongoDB Atlas** — cloud database for storing all app data
- **Mongoose** — schema modeling and validation for Node.js
- **AWS S3** — cloud storage for listing and housing images

---

## Collections

| Collection | Description |
|---|---|
| `users` | Verified UMass student accounts |
| `listings` | Items posted for sale on the marketplace |
| `housingareas` | Housing info around UMass / Five College area |
| `reviews` | Student-to-student reviews after transactions |
| `housingreviews` | Reviews students leave about housing areas |

---

## Image Storage (AWS S3)

Images are **never stored in MongoDB**. Instead:
1. User uploads an image
2. Image is sent directly to AWS S3 bucket
3. S3 returns a URL
4. That URL is saved in MongoDB under `imageUrls`

### S3 Bucket Structure
```
reloop-umass-images/
├── listings/    ← marketplace item images
└── housing/     ← housing area images and floor plans
```

### Schema Fields for Images
- `Listing.imageUrls` — array of { url, key } objects
- `HousingArea.imageUrls` — array of { url, key } objects
- `HousingArea.floorPlanUrls` — array of { url, key } objects

The `key` field is the S3 file path — needed to delete images when a listing is removed.

---

## Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/ssania/ReLoop.git
cd ReLoop/backend/database
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a .env file
```
MONGODB_URI=ask database lead privately
AWS_ACCESS_KEY_ID=ask database lead privately
AWS_SECRET_ACCESS_KEY=ask database lead privately
AWS_REGION=us-east-1
S3_BUCKET_NAME=reloop-umass-images
```

> Never commit your .env file — it is listed in .gitignore

### 4. Run the seed file
```bash
node seed.js
```

You should see:
```
Connected to MongoDB
Seed data inserted!
```

### 5. Verify in MongoDB Atlas
Go to cloud.mongodb.com and check all 5 collections have data.

---

## Folder Structure

```
database/
├── models/
│   ├── User.js
│   ├── Listing.js
│   ├── Review.js
│   ├── HousingArea.js
│   └── HousingReview.js
├── s3.js          ← AWS S3 upload config
├── seed.js        ← sample data for testing
├── .env           ← never push this
├── .gitignore
└── package.json
```

---

## Contact

For MongoDB and AWS credentials contact the database lead privately — do not share keys in GitHub
