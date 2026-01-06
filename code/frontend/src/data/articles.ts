export interface Article {
  id: string;
  slug: string;
  date: string;
  author: string;
  image?: string;
  title: {
    en: string;
    de: string;
    bg: string;
    [key: string]: string;
  };
  summary: {
    en: string;
    de: string;
    bg: string;
    [key: string]: string;
  };
  content: {
    en: string;
    de: string;
    bg: string;
    [key: string]: string;
  };
}

export const articles: Article[] = [
  {
    id: "1",
    slug: "how-fakeout-works",
    date: "2026-01-05",
    author: "Fakeout Team",
    title: {
      en: "How Fakeout Works: The Game of AI Detection",
      de: "Wie Fakeout funktioniert: Das Spiel der KI-Erkennung",
      bg: "Как работи Fakeout: Играта за разпознаване на ИИ",
    },
    summary: {
      en: "Learn about the mechanics behind Fakeout and how we challenge your ability to spot AI-generated content.",
      de: "Erfahre mehr über die Mechanik hinter Fakeout und wie wir deine Fähigkeit testen, KI-generierte Inhalte zu erkennen.",
      bg: "Научете за механиката зад Fakeout и как предизвикваме способността ви да откривате съдържание, генерирано от ИИ.",
    },
    content: {
      en: `
# How Fakeout Works

Fakeout is designed to test and improve your ability to distinguish between real photography and AI-generated imagery. In an era where synthetic media is becoming increasingly realistic, developing a keen eye for detail is more important than ever.

## The Mechanics

In each round, you are presented with two images side-by-side.
- **One is a real photograph**, sourced from high-quality stock photography libraries.
- **The other is AI-generated**, created using state-of-the-art generative models.

Your task is simple: **Identify the AI-generated image.**

## Behind the Scenes

We use a variety of generative models to create our AI images, ensuring a diverse range of styles and "tells". Some models might struggle with hands, while others might create unnatural lighting or textures.

The real images are carefully selected to match the theme or subject matter of the AI generation, making the comparison fair but challenging.

## Why Play?

Playing Fakeout helps you:
1.  **Sharpen your critical thinking** when consuming visual media.
2.  **Learn the common artifacts** of current AI technology.
3.  **Track your progress** over time as you get better at spotting fakes.

Join us daily for new challenges!
`,
      de: `
# Wie Fakeout funktioniert

Fakeout wurde entwickelt, um deine Fähigkeit zu testen und zu verbessern, zwischen echter Fotografie und KI-generierten Bildern zu unterscheiden. In einer Zeit, in der synthetische Medien immer realistischer werden, ist ein geschultes Auge für Details wichtiger denn je.

## Die Mechanik

In jeder Runde werden dir zwei Bilder nebeneinander präsentiert.
- **Eines ist ein echtes Foto**, das aus hochwertigen Bilddatenbanken stammt.
- **Das andere ist KI-generiert**, erstellt mit modernsten generativen Modellen.

Deine Aufgabe ist einfach: **Identifiziere das KI-generierte Bild.**

## Hinter den Kulissen

Wir verwenden eine Vielzahl generativer Modelle, um unsere KI-Bilder zu erstellen, und gewährleisten so eine vielfältige Palette an Stilen und "Indizien". Einige Modelle haben vielleicht Probleme mit Händen, während andere unnatürliche Beleuchtung oder Texturen erzeugen könnten.

Die echten Bilder werden sorgfältig ausgewählt, um zum Thema oder Motiv der KI-Generierung zu passen, was den Vergleich fair, aber herausfordernd macht.

## Warum spielen?

Fakeout zu spielen hilft dir:
1.  **Dein kritisches Denken zu schärfen**, wenn du visuelle Medien konsumierst.
2.  **Die üblichen Artefakte** aktueller KI-Technologie kennenzulernen.
3.  **Deinen Fortschritt zu verfolgen**, während du besser darin wirst, Fälschungen zu erkennen.

Mach täglich mit bei neuen Herausforderungen!
`,
      bg: `
# Как работи Fakeout

Fakeout е предназначен да тества и подобри способността ви да различавате истинска фотография от изображения, генерирани от ИИ. В ера, в която синтетичните медии стават все по-реалистични, развиването на остро око за детайла е по-важно от всякога.

## Механиката

Във всеки рунд ви се представят две изображения едно до друго.
- **Едното е истинска снимка**, взета от висококачествени библиотеки със стокова фотография.
- **Другото е генерирано от ИИ**, създадено с помощта на най-съвременни генеративни модели.

Вашата задача е проста: **Идентифицирайте изображението, генерирано от ИИ.**

## Зад кулисите

Ние използваме разнообразни генеративни модели за създаване на нашите ИИ изображения, осигурявайки разнообразна гама от стилове и "издайнически знаци". Някои модели може да се затрудняват с ръцете, докато други може да създават неестествено осветление или текстури.

Истинските изображения са внимателно подбрани, за да съответстват на темата или сюжета на ИИ генерацията, което прави сравнението честно, но предизвикателно.

## Защо да играете?

Играта на Fakeout ви помага:
1.  **Да изострите критичното си мислене**, когато консумирате визуални медии.
2.  **Да научите често срещаните артефакти** на текущата ИИ технология.
3.  **Да проследявате напредъка си** във времето, докато ставате по-добри в откриването на фалшификати.

Присъединете се към нас ежедневно за нови предизвикателства!
`,
    },
  },
  {
    id: "2",
    slug: "ai-generation-concerns",
    date: "2026-01-06",
    author: "Paul",
    title: {
      en: "Thoughts on Recent Developments in AI Generation (2024-2025)",
      de: "Gedanken zu den jüngsten Entwicklungen der KI-Generierung (2024-2025)",
      bg: "Мисли за последните развития в ИИ генерацията (2024-2025)",
    },
    summary: {
      en: "A look at the rapid advancements in AI video and image generation, and the ethical concerns they raise.",
      de: "Ein Blick auf die rasanten Fortschritte bei der KI-Video- und Bildgenerierung und die ethischen Bedenken, die sie aufwerfen.",
      bg: "Поглед към бързия напредък в генерирането на видео и изображения от ИИ и етичните въпроси, които те повдигат.",
    },
    content: {
      en: `
# AI Generation: Progress and Peril (2024-2025)

The landscape of AI-generated media has shifted dramatically in the last two years. From 2024 to early 2026, we've witnessed a transition from "uncanny valley" experiments to hyper-realistic video and imagery that is often indistinguishable from reality.

## The Leap in Quality

Tools like OpenAI's Sora and Google's Veo have revolutionized video generation. What used to be jittery, low-resolution clips are now high-definition, coherent videos with complex camera movements and consistent physics. Image generation has similarly matured, with models now capable of rendering text, hands, and complex textures with startling accuracy.

## The Growing Concerns

With great power comes great responsibility, and unfortunately, great risk.

### Misinformation and Deepfakes
The sheer ease of creating convincing fake footage is perhaps the biggest concern. We've seen an uptick in political deepfakes and misinformation campaigns that leverage the unsuspecting trust people place in video evidence. The "shared reality" we rely on for public discourse is under threat.

### Intellectual Property
Artists and creators continue to voice valid concerns about their work being used to train these massive models without consent or compensation. The legal frameworks are still catching up to the technology, leaving a gray area where style mimicry creates economic friction.

### Privacy
Non-consensual deepfake content remains a pervasive issue. The ability to generate realistic likenesses of individuals without their permission poses severe privacy violations and potential for harassment.

## Looking Forward

As we continue to develop Fakeout, our goal isn't just to provide a game, but to provide a training ground. We believe that **media literacy** is the best defense against misinformation. By training your eyes to spot the subtle flaws in AI generation, you become a more resilient consumer of information in the digital age.

The technology is here to stay. The question is: are we ready to adapt to it?
`,
      de: `
# KI-Generierung: Fortschritt und Gefahr (2024-2025)

Die Landschaft der KI-generierten Medien hat sich in den letzten zwei Jahren dramatisch verändert. Von 2024 bis Anfang 2026 haben wir einen Übergang von "Uncanny Valley"-Experimenten zu hyperrealistischen Videos und Bildern erlebt, die oft nicht von der Realität zu unterscheiden sind.

## Der Qualitätssprung

Tools wie OpenAI's Sora und Google's Veo haben die Videogenerierung revolutioniert. Was früher wackelige, niedrig aufgelöste Clips waren, sind heute hochauflösende, kohärente Videos mit komplexen Kamerabewegungen und konsistenter Physik. Die Bildgenerierung ist ebenfalls gereift, wobei Modelle nun in der Lage sind, Text, Hände und komplexe Texturen mit verblüffender Genauigkeit darzustellen.

## Die wachsenden Bedenken

Mit großer Macht kommt große Verantwortung und leider auch großes Risiko.

### Fehlinformationen und Deepfakes
Die schiere Leichtigkeit, überzeugendes gefälschtes Material zu erstellen, ist vielleicht die größte Sorge. Wir haben einen Anstieg politischer Deepfakes und Desinformationskampagnen gesehen, die das arglose Vertrauen nutzen, das Menschen in Videobeweise setzen. Die "gemeinsame Realität", auf die wir uns für den öffentlichen Diskurs verlassen, ist bedroht.

### Geistiges Eigentum
Künstler und Schöpfer äußern weiterhin berechtigte Bedenken, dass ihre Arbeit verwendet wird, um diese riesigen Modelle ohne Zustimmung oder Entschädigung zu trainieren. Die rechtlichen Rahmenbedingungen hinken der Technologie noch hinterher und hinterlassen eine Grauzone, in der Stilnachahmung wirtschaftliche Reibungen verursacht.

### Privatsphäre
Nicht einvernehmliche Deepfake-Inhalte bleiben ein weit verbreitetes Problem. Die Fähigkeit, realistische Abbilder von Personen ohne deren Erlaubnis zu erstellen, stellt schwere Verletzungen der Privatsphäre und Potenzial für Belästigung dar.

## Blick nach vorne

Während wir Fakeout weiterentwickeln, ist unser Ziel nicht nur, ein Spiel bereitzustellen, sondern ein Trainingsgelände. Wir glauben, dass **Medienkompetenz** die beste Verteidigung gegen Fehlinformationen ist. Indem du deine Augen trainierst, die subtilen Fehler in der KI-Generierung zu erkennen, wirst du ein widerstandsfähigerer Konsument von Informationen im digitalen Zeitalter.

Die Technologie ist gekommen, um zu bleiben. Die Frage ist: Sind wir bereit, uns daran anzupassen?
`,
      bg: `
# ИИ Генерация: Прогрес и Опасност (2024-2025)

Пейзажът на медиите, генерирани от ИИ, се промени драстично през последните две години. От 2024 г. до началото на 2026 г. станахме свидетели на преход от експерименти в "зловещата долина" към хиперреалистични видеоклипове и изображения, които често са неразличими от реалността.

## Скокът в качеството

Инструменти като Sora на OpenAI и Veo на Google направиха революция в генерирането на видео. Това, което преди бяха трептящи клипове с ниска разделителна способност, сега са видеоклипове с висока разделителна способност, съгласуваност, сложни движения на камерата и последователна физика. Генерирането на изображения също узря, като моделите вече са способни да рендират текст, ръце и сложни текстури с поразителна точност.

## Растящите опасения

С голяма сила идва голяма отговорност, а за съжаление и голям риск.

### Дезинформация и Deepfakes
Лекотата, с която може да се създават убедителни фалшиви кадри, е може би най-голямата грижа. Виждаме ръст на политическите deepfakes и кампании за дезинформация, които използват нищо неподозиращото доверие, което хората възлагат на видео доказателствата. "Споделената реалност", на която разчитаме за обществения дискурс, е под заплаха.

### Интелектуална собственост
Художници и творци продължават да изразяват основателни опасения, че тяхната работа се използва за обучение на тези масивни модели без съгласие или компенсация. Правните рамки все още догонват технологията, оставяйки сива зона, където имитацията на стил създава икономическо триене.

### Лична неприкосновеност
Съдържанието с deepfake без съгласие остава широко разпространен проблем. Способността да се генерират реалистични образи на индивиди без тяхното разрешение представлява сериозно нарушение на личната неприкосновеност и потенциал за тормоз.

## Поглед напред

Докато продължаваме да развиваме Fakeout, нашата цел не е само да предоставим игра, а да осигурим тренировъчен полигон. Вярваме, че **медийната грамотност** е най-добрата защита срещу дезинформацията. Като тренирате очите си да забелязват фините недостатъци в генерирането от ИИ, вие ставате по-устойчив потребител на информация в дигиталната ера.

Технологията е тук, за да остане. Въпросът е: готови ли сме да се адаптираме към нея?
`,
    },
  },
];
