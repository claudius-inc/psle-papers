import { ref, onMounted } from "vue";

export interface DropdownOption {
  code: string;
  name: string;
}

export interface DropdownData {
  Level: DropdownOption[];
  Subject: DropdownOption[];
  Type: DropdownOption[];
  Year: DropdownOption[];
  School: DropdownOption[];
}

export interface ParsedPaper {
  filename: string;
  levelCode: string;
  schoolCode: string;
  subjectCode: string;
  typeCode: string;
  yearCode: string;
  // Display names
  levelName: string;
  schoolName: string;
  subjectName: string;
  typeName: string;
}

export const usePapers = () => {
  const loading = ref(true);
  const rawFiles = ref<string[]>([]);
  const options = ref<DropdownData>({
    Level: [],
    Subject: [],
    Type: [],
    Year: [],
    School: [],
  });

  const getName = (category: keyof DropdownData, code: string): string => {
    const found = options.value[category]?.find((opt) => opt.code === code);
    return found ? found.name : code;
  };

  const parseFilename = (filename: string): ParsedPaper | null => {
    const parts = filename.split("_");
    if (parts.length !== 5) return null;

    const [levelCode, schoolCode, subjectCode, typeCode, yearCode] = parts as [
      string,
      string,
      string,
      string,
      string,
    ];

    return {
      filename,
      levelCode,
      schoolCode,
      subjectCode,
      typeCode,
      yearCode,
      levelName: getName("Level", levelCode),
      schoolName: getName("School", schoolCode),
      subjectName: getName("Subject", subjectCode),
      typeName: getName("Type", typeCode),
    };
  };

  const fetchData = async () => {
    try {
      const [filesRes, optionsRes] = await Promise.all([
        fetch("/json/files.json"),
        fetch("/json/dropdownOptions.json"),
      ]);

      rawFiles.value = await filesRes.json();
      options.value = await optionsRes.json();
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    rawFiles,
    options,
    getName,
    parseFilename,
    fetchData,
  };
};
