const pdfRepositoryBaseUrl =
  "https://raw.githubusercontent.com/airbob/PrimarySchoolExamPapers/main/public/files";

export const buildPdfFileUrl = (filename: string) =>
  `${pdfRepositoryBaseUrl}/${encodeURIComponent(filename)}.pdf`;
