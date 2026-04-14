# ghtrollers

Produktionsrepo för två separata webbappar:

- **Gäddhäng Trollers** – fisketävling med medlemmar, fångstrapporter, leaderboard, Big Five, all-time-high, galleri, karta och achievements
- **SFVOF** – separat del med egen inloggning, egna sidor och egen logik

## Viktig regel: strikt isolering

Det här repo:t innehåller **två logiskt separata system**.

### Gäddhäng
Kod ligger främst under:
- `src/app/*`
- `src/components/*`
- `src/hooks/*`
- `src/lib/*`

### SFVOF
Kod ligger främst under:
- `sfvof/src/*`
- `src/app/sfvof/*`
- `public/sfvof/*`
- `sfvof/sql/*`

### Hård regel
Ändringar för **SFVOF får inte påverka Gäddhäng**, och ändringar för **Gäddhäng får inte påverka SFVOF**.

Var extra försiktig när du rör:
- delade helpers i `src/lib/*`
- auth-relaterad logik
- datamodeller och medlemskopplingar
- visningslager som använder namn, profilbild eller identity keys

## Teknikstack

- Next.js 16
- React 19
- TypeScript
- Supabase
- Tailwind CSS 4
- Vitest
- GitHub Actions

## Node-version

Projektet använder **Node 22**.

Se:
- `.nvmrc`

## Lokalt utvecklingsflöde

Installera beroenden:

```bash
npm ci
```

Starta dev-server:

```bash
npm run dev
```

Bygg produktion:

```bash
npm run build
```

Kör lint:

```bash
npm run lint
```

Kör tester i watch-läge:

```bash
npm run test
```

Kör tester en gång:

```bash
npm run test:run
```

## Miljövariabler

Projektet använder Supabase-miljövariabler via `.env.local` lokalt och miljövariabler i deploymiljö.

Exempel på variabler som används i CI/build:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

Använd aldrig produktionshemligheter i repo:t.

## CI

GitHub Actions-workflow finns i:

- `.github/workflows/ci.yml`

CI kör följande på push och pull requests:

1. `npm ci`
2. `npm run lint`
3. `npm run test:run`
4. `npm run build`

Syftet är att stoppa trasiga ändringar tidigt.

## Affärskritiska områden

Var extra försiktig i följande områden:

### 1. Identitet och medlemmar
Gäddhäng använder nu ID-baserad identitet för catches.

Centrala fält i `catches`:
- `caught_for_member_id`
- `registered_by_member_id`

Målet är att namnändringar inte ska bryta:
- Min sida
- leaderboard
- achievements
- Big Five
- all-time-high
- privat platslogik

**Medlems-ID är primär identitet.** Namn får bara användas som fallback i visningslager där det verkligen behövs.

### 2. Big Five
Big Five är affärskritisk logik.

Regler:
- beräknas per år när det gäller tävlingsresultat och all-time-uttag av bästa år
- abborre räknas med vikt x4
- endast tävlingsrelevanta catches ska räknas

### 3. Tävlingsrelevans
Live-scope och Utomlands ska inte räknas i tävlingsresultat där reglerna säger nej.

Samtidigt ska achievements för rapporterade fångster fortfarande kunna räkna antal rapporterade fångster enligt etablerad logik.

### 4. Privat platslogik
Privata platser får inte exponeras fel.

Nuvarande modell bygger på att:
- utloggade inte ska se privata platsdetaljer
- vanliga användare bara ska se det de har rätt till
- super admin kan se privata registreringar enligt etablerade regler

### 5. Auth och medlemsstatus
Var extra försiktig med:
- inloggning
- verifiering
- medlemsgodkännande
- admin-status
- skillnaden mellan Gäddhäng och SFVOF

## Testtäckning som redan finns

Nuvarande testsvit låser kärnlogik för:

- achievement-nivåer
- catch identity
- privat plats-synlighet
- Big Five och tävlingsregler
- home-resultat
- member page-format och member stats

Testerna finns under:
- `tests/`

Målet med dessa tester är att fånga regressioner i domänlogik utan att ändra produktionsbeteende.

## Ändringsregler för livekritiska delar

När du ändrar kod i detta repo:

- gör små steg
- undvik bred refaktor om det inte behövs
- verifiera alltid med `lint`, `test:run` och `build`
- rör inte auth, medlemsstatus, catches, Big Five eller privat platslogik lättvindigt
- rör inte SFVOF och Gäddhäng i samma svep om det går att undvika
- håll bakåtkompatibilitet när det är möjligt

## Databas och SQL

SFVOF-specifik SQL finns under:
- `sfvof/sql/`

Var försiktig med schema- och policyändringar. Ändringar i SQL/RLS ska behandlas som högrisk eftersom de direkt kan påverka riktiga användare.

## Rekommenderat arbetssätt

Inför varje ändring i känsliga delar:

1. förstå vilket domänkontrakt som gäller
2. uppdatera eller lägg till test om kontraktet ska låsas
3. kör lokalt:
   - `npm run lint`
   - `npm run test:run`
   - `npm run build`
4. pusha till branch och invänta grön CI
5. först därefter merge eller produktion

## Nästa förbättringar

Nu när testbas och CI finns på plats är nästa naturliga steg:
- fortsätta förbättra dokumentation
- beta av lint-warnings i små block
- stärka branch protection / mergekrav
- fortsätta täcka fler rena domänfunktioner med tester
