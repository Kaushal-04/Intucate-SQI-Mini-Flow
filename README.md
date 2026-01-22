# Intucate SQI Mini-Flow

This project implements the Student Quality Index (SQI) Diagnostic Agent flow. It includes a mock authentication system, an Admin Console for inputting diagnostic data, and a robust SQI calculation engine running purely on the client side.

## Features

- **SQI Engine**: Computes Overall SQI, Topic/Concept scores, and generates weighted concept rankings for the Summary Customizer Agent.
- **Admin Console**: Interface to manage Diagnostic Agent prompts and process student data.
- **Premium UI**: Glassmorphism design with a dark, modern aesthetic.
- **Mock Auth**: secure-ish login simulation (email: `*@intucate.com`, password: min 8 chars).

## Tech Stack

- React 18
- Vite
- TypeScript
- Vanilla CSS (Glassmorphism & CSS Variables)

## Setup & Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173).

3. **Build for Production**
   ```bash
   npm run build
   npm run preview
   ```

## Usage Flow

1. **Login**: Use any email ending in `@intucate.com` (e.g., `admin@intucate.com`) and a password with 8+ characters.
2. **Admin Console**:
   - **Diagnostic Prompt**: Paste/Edit the prompt for the Diagnostic Agent.
   - **Input Data**: Paste the JSON output from a student's diagnostic test attempts.
3. **Compute**: Click "Compute SQI".
4. **Results**: View the dashboard and download the `summary_customizer_input.json`.

## Input Schema Example

```json
{
  "student_id": "S001",
  "attempts": [
    {
      "topic": "Borrowing Costs",
      "concept": "Definitions",
      "importance": "A",
      "difficulty": "M",
      "type": "Theory",
      "case_based": false,
      "correct": false,
      "marks": 2,
      "neg_marks": 0.5,
      "expected_time_sec": 90,
      "time_spent_sec": 130,
      "marked_review": true,
      "revisits": 1
    }
    // ...
  ]
}
```
