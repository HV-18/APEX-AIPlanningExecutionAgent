import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

// Supported languages with full translations
const languages = {
    "Africa": [
        { code: "sw", name: "Swahili" },
    ],
    "Asia": [
        { code: "zh", name: "Mandarin Chinese" },
        { code: "hi", name: "Hindi" },
        { code: "ja", name: "Japanese" },
        { code: "ko", name: "Korean" },
        { code: "ar-sa", name: "Arabic (Saudi Arabia)" },
        { code: "id", name: "Indonesian" },
        { code: "tr", name: "Turkish" },
        { code: "vi", name: "Vietnamese" },
    ],
    "Europe": [
        { code: "es-es", name: "Spanish (Spain)" },
        { code: "fr-fr", name: "French (France)" },
        { code: "de", name: "German" },
        { code: "it", name: "Italian" },
        { code: "ru", name: "Russian" },
    ],
    "Americas": [
        { code: "en-us", name: "English (US)" },
        { code: "pt-br", name: "Portuguese (Brazil)" },
    ],
};

export function LanguageSelector() {
    const { i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "en-us");

    useEffect(() => {
        setSelectedLanguage(i18n.language || "en-us");
    }, [i18n.language]);

    const handleLanguageChange = (langCode: string) => {
        setSelectedLanguage(langCode);
        i18n.changeLanguage(langCode);
    };

    return (
        <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px] h-9 bg-background/50 backdrop-blur-sm border-input">
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Select Language" />
                </div>
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
                {Object.entries(languages).map(([continent, langs]) => (
                    <SelectGroup key={continent}>
                        <SelectLabel className="font-bold text-primary sticky top-0 bg-popover z-10">
                            {continent}
                        </SelectLabel>
                        {langs.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                ))}
            </SelectContent>
        </Select>
    );
}
