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
const supportedLanguages = [
    'en-us', 'es-es', 'fr-fr', 'de', 'zh', 'ja', 'pt-br', 'hi',
    'ar-sa', 'ko', 'ru', 'id', 'tr', 'sw', 'vi', 'it'
];

const languages = {
    "Africa": [
        { code: "sw", name: "Swahili ✓" },
        { code: "am", name: "Amharic" },
        { code: "yo", name: "Yoruba" },
        { code: "ig", name: "Igbo" },
        { code: "ha", name: "Hausa" },
        { code: "zu", name: "Zulu" },
        { code: "xh", name: "Xhosa" },
        { code: "ar-eg", name: "Arabic (Egypt)" },
        { code: "fr-cd", name: "French (DRC)" },
        { code: "pt-ao", name: "Portuguese (Angola)" },
    ],
    "Asia": [
        { code: "zh", name: "Mandarin Chinese ✓" },
        { code: "hi", name: "Hindi ✓" },
        { code: "ja", name: "Japanese ✓" },
        { code: "ko", name: "Korean ✓" },
        { code: "ar-sa", name: "Arabic (Saudi Arabia) ✓" },
        { code: "bn", name: "Bengali" },
        { code: "id", name: "Indonesian ✓" },
        { code: "tr", name: "Turkish ✓" },
        { code: "vi", name: "Vietnamese ✓" },
        { code: "th", name: "Thai" },
    ],
    "Europe": [
        { code: "en-gb", name: "English (UK)" },
        { code: "es-es", name: "Spanish (Spain) ✓" },
        { code: "fr-fr", name: "French (France) ✓" },
        { code: "de", name: "German ✓" },
        { code: "it", name: "Italian ✓" },
        { code: "pt-pt", name: "Portuguese (Portugal)" },
        { code: "ru", name: "Russian ✓" },
        { code: "pl", name: "Polish" },
        { code: "nl", name: "Dutch" },
        { code: "el", name: "Greek" },
    ],
    "North America": [
        { code: "en-us", name: "English (US) ✓" },
        { code: "es-mx", name: "Spanish (Mexico)" },
        { code: "fr-ca", name: "French (Canada)" },
        { code: "ht", name: "Haitian Creole" },
        { code: "jam", name: "Jamaican Patois" },
        { code: "nv", name: "Navajo" },
        { code: "myn", name: "Mayan" },
        { code: "nah", name: "Nahuatl" },
        { code: "es-cr", name: "Spanish (Costa Rica)" },
        { code: "es-pa", name: "Spanish (Panama)" },
    ],
    "South America": [
        { code: "es-ar", name: "Spanish (Argentina)" },
        { code: "pt-br", name: "Portuguese (Brazil) ✓" },
        { code: "es-co", name: "Spanish (Colombia)" },
        { code: "es-pe", name: "Spanish (Peru)" },
        { code: "es-cl", name: "Spanish (Chile)" },
        { code: "es-ve", name: "Spanish (Venezuela)" },
        { code: "qu", name: "Quechua" },
        { code: "gn", name: "Guarani" },
        { code: "ay", name: "Aymara" },
        { code: "es-ec", name: "Spanish (Ecuador)" },
    ],
    "Oceania": [
        { code: "en-au", name: "English (Australia)" },
        { code: "en-nz", name: "English (New Zealand)" },
        { code: "mi", name: "Maori" },
        { code: "sm", name: "Samoan" },
        { code: "fj", name: "Fijian" },
        { code: "to", name: "Tongan" },
        { code: "tpi", name: "Tok Pisin" },
        { code: "fr-nc", name: "French (New Caledonia)" },
        { code: "pau", name: "Palauan" },
        { code: "mh", name: "Marshallese" },
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
        
        // Show feedback message
        const isSupported = supportedLanguages.includes(langCode);
        if (!isSupported) {
            console.log(`Language ${langCode} will use English fallback - full translation coming soon`);
        }
    };

    return (
        <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px] h-9 bg-background/50 backdrop-blur-sm border-input">
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Select Language" />
                </div>
            </SelectTrigger>
            <SelectContent className="max-h-[500px]">
                <div className="px-2 py-1.5 text-xs text-muted-foreground border-b sticky top-0 bg-popover z-20">
                    ✓ = Full translations available
                </div>
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
