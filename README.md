# Singapore Primary School Exam Papers

This project is a modern web application for browsing and downloading Singapore Primary School exam papers. It is built with **Nuxt 4** and **Vue 3**, offering a responsive and fast user experience.

## ✨ Features

- **Filtering**: Easily filter papers by Level, Subject, School, Exam Type, and Year.
- **Fast Search**: Instant filtering of thousands of exam papers.
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop.
- **Premium UI**: Clean, modern interface with a focus on readability and ease of use.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (comes with Node.js)

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repo-url>
    cd PrimarySchoolExamPapers
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Locally

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To build the application for deployment:

```bash
npm run build
```

The output will be in the `.output` directory.

To generate a static site (SSG):

```bash
npm run generate
```

This also regenerates `public/sitemap.xml` before Nuxt exports the site.

The output will be in the `.output/public` directory.

### SEO Audit

After generating the static site, run:

```bash
npm run seo:audit
```

The audit checks generated titles, descriptions, JSON-LD, sitemap coverage, and internal links. The GitHub Pages workflow runs the same audit before uploading the deploy artifact.

After deployment, run:

```bash
npm run seo:audit:live
```

The live audit checks `https://sgexamhub.com` for the deployed sitemap, robots.txt, key landing pages, schema markers, and indexed paper pages.

Use [`SEO_KEYWORD_MAP.md`](SEO_KEYWORD_MAP.md) after deployment to map Google Search Console queries to the intended landing pages before changing titles or copy.

## 📂 Project Structure

- **`app/app.vue`**: The main application component containing the UI logic and template.
- **`public/`**: Static assets served directly.
    - **`files/`**: Contains the PDF exam papers.
    - **`json/`**: Contains the data files (`files.json` and `dropdownOptions.json`).
- **`nuxt.config.ts`**: Nuxt configuration file.

## 📄 Data Management

The application uses two JSON files in `public/json/` to manage data:

1.  **`files.json`**: A list of all available PDF filenames (e.g., `4_7102_3_1_2023`).
2.  **`dropdownOptions.json`**: Mappings for the codes used in filenames (e.g., mapping `7102` to "Catholic High School").

To add new papers, simply upload the PDF to `public/files/` and update `public/json/files.json` with the new filename.

After adding papers, run `npm run generate` and `npm run seo:audit` before deploying.
