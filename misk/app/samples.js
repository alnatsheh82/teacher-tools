/* مِسك الختام — أمثلة جاهزة: حديث «إنما الأعمال بالنيات» */
window.MK.samples = [
  {
    app: 'misk', v: 1, id: 'sample-erase', sample: true, template: 'erase', theme: 'seal',
    title: 'حديث: إنما الأعمال بالنيات (حفظ)',
    settings: { teams: false, timer: 0 },
    content: {
      texts: [{
        intro: 'عَنْ أَمِيرِ المُؤْمِنِينَ أَبِي حَفْصٍ عُمَرَ بْنِ الخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ:',
        text: '«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ»',
        source: 'رواه البخاري ومسلم'
      }],
      mode: 'random', steps: 4, includeExtras: false
    }
  },
  {
    app: 'misk', v: 1, id: 'sample-quiz', sample: true, template: 'quiz', theme: 'waha',
    title: 'حديث: إنما الأعمال بالنيات (اختبار)',
    settings: { teams: false, timer: 20 },
    content: {
      shuffleQ: false, shuffleOpts: true,
      questions: [
        { q: 'من راوي حديث «إنما الأعمال بالنيات»؟', options: ['عمر بن الخطاب رضي الله عنه', 'أبو هريرة رضي الله عنه', 'عبد الله بن عباس رضي الله عنهما', 'أنس بن مالك رضي الله عنه'], correct: 0 },
        { q: 'بحسب الحديث، على أي شيء تقوم الأعمال؟', options: ['النية', 'كثرة العمل', 'سرعة الإنجاز', 'ثناء الناس'], correct: 0 },
        { q: 'من كانت هجرته لدنيا يصيبها، فهجرته…', options: ['إلى ما هاجر إليه', 'إلى الله ورسوله', 'مقبولة في كل حال', 'لا يُسأل عنها'], correct: 0 },
        { q: 'الحديث متفق عليه، أي رواه…', options: ['البخاري ومسلم', 'أبو داود والترمذي', 'أحمد ومالك', 'النسائي وابن ماجه'], correct: 0 }
      ]
    }
  },
  {
    app: 'misk', v: 1, id: 'sample-unjumble', sample: true, template: 'unjumble', theme: 'rawda',
    title: 'تعاريف درس النية (رتّب التعريف)',
    settings: { teams: true, timer: 0 },
    content: {
      shuffle: false,
      items: [
        { term: 'النية', definition: 'عزم القلب / على فعل العبادة / تقربًا / إلى الله تعالى' },
        { term: 'الإخلاص', definition: 'إرادة / وجه الله تعالى / بالعمل' },
        { term: 'الهجرة', definition: 'الانتقال / من دار الكفر / إلى دار الإسلام' }
      ]
    }
  }
];
window.MK.samples.push(
  {
    app: 'misk', v: 1, id: 'sample-tf', sample: true, template: 'tf', theme: 'fun',
    title: 'حديث النية (صح أم خطأ)', settings: { teams: true, timer: 15 },
    content: { shuffle: false, items: [
      { text: 'النية محلها القلب.', answer: true },
      { text: 'راوي حديث «إنما الأعمال بالنيات» هو أبو هريرة رضي الله عنه.', answer: false },
      { text: 'من كانت هجرته لدنيا يصيبها فهجرته إلى ما هاجر إليه.', answer: true },
      { text: 'يكفي أن يكون العمل صالحًا في ظاهره ولو فسدت النية.', answer: false },
      { text: 'حديث «إنما الأعمال بالنيات» رواه البخاري ومسلم.', answer: true }
    ] }
  },
  {
    app: 'misk', v: 1, id: 'sample-match', sample: true, template: 'match', theme: 'rawda',
    title: 'مصطلحات درس النية (المطابقة)', settings: { teams: false, timer: 0 },
    content: { shuffle: true, pairs: [
      { a: 'النية', b: 'عزم القلب على فعل العبادة تقربًا إلى الله' },
      { a: 'الإخلاص', b: 'إرادة وجه الله تعالى بالعمل' },
      { a: 'الهجرة', b: 'الانتقال من دار الكفر إلى دار الإسلام' },
      { a: 'الرياء', b: 'إظهار العبادة ليراها الناس فيمدحوا صاحبها' },
      { a: 'متفق عليه', b: 'ما رواه البخاري ومسلم' }
    ] }
  },
  {
    app: 'misk', v: 1, id: 'sample-cloze', sample: true, template: 'cloze', theme: 'seal',
    title: 'حديث النية (الكلمة المفقودة)', settings: { teams: false, timer: 0 },
    content: { texts: [{
      text: '«إنما الأعمال [بالنيات]، وإنما لكل امرئ [ما نوى]، فمن كانت [هجرته] إلى الله ورسوله فهجرته إلى الله ورسوله، ومن كانت هجرته [لدنيا] يصيبها أو امرأة ينكحها فهجرته إلى [ما هاجر إليه]»',
      extra: 'بالأقوال، ما عمل'
    }] }
  },
  {
    app: 'misk', v: 1, id: 'sample-wheel', sample: true, template: 'wheel', theme: 'waha',
    title: 'أسئلة الغلق: حديث النية (العجلة)', settings: { teams: false, timer: 0 },
    content: { remove: true, items: ['ما معنى النية؟', 'من راوي الحديث؟', 'اذكر عملًا تجعله النية عبادة', 'ما معنى «متفق عليه»؟', 'ما جزاء من هاجر لدنيا يصيبها؟', 'كيف تُخلص نيتك في المذاكرة؟'] }
  },
  {
    app: 'misk', v: 1, id: 'sample-boxes', sample: true, template: 'boxes', theme: 'fun',
    title: 'حديث النية (افتح الصندوق)', settings: { teams: true, timer: 30 },
    content: { shuffle: true, items: [
      { q: 'ما محل النية؟', a: 'القلب' },
      { q: 'من راوي حديث «إنما الأعمال بالنيات»؟', a: 'عمر بن الخطاب رضي الله عنه' },
      { q: 'ما معنى «متفق عليه»؟', a: 'رواه البخاري ومسلم' },
      { q: 'ما جزاء من هاجر لدنيا يصيبها؟', a: 'هجرته إلى ما هاجر إليه' },
      { q: 'كيف تجعل نومك عبادة تؤجر عليها؟', a: 'أن تنوي به التقوّي على طاعة الله' },
      { q: 'اذكر فائدة من فوائد الحديث.', a: 'الأعمال تُقبل وتُثاب بحسب النية الصالحة' }
    ] }
  },
  {
    app: 'misk', v: 1, id: 'sample-flash', sample: true, template: 'flash', theme: 'seal',
    title: 'مصطلحات درس النية (البطاقات)', settings: { teams: false, timer: 0 },
    content: { shuffle: false, cards: [
      { front: 'النية', back: 'عزم القلب على فعل العبادة تقربًا إلى الله تعالى' },
      { front: 'الإخلاص', back: 'إرادة وجه الله تعالى بالعمل' },
      { front: 'الهجرة', back: 'الانتقال من دار الكفر إلى دار الإسلام' },
      { front: 'متفق عليه', back: 'ما رواه البخاري ومسلم' }
    ] }
  }
);

window.MK.samples.push(
  {
    app: 'misk', v: 1, id: 'sample-ayah', sample: true, template: 'erase', theme: 'rawda',
    title: 'آية الكرسي (حفظ)', settings: { teams: false, timer: 0 },
    content: { texts: [{ intro: 'قال الله تعالى:', text: "﴿ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلۡحَيُّ ٱلۡقَيُّومُۚ لَا تَأۡخُذُهُۥ سِنَةٞ وَلَا نَوۡمٞۚ لَّهُۥ مَا فِي ٱلسَّمَٰوَٰتِ وَمَا فِي ٱلۡأَرۡضِۗ مَن ذَا ٱلَّذِي يَشۡفَعُ عِندَهُۥٓ إِلَّا بِإِذۡنِهِۦۚ يَعۡلَمُ مَا بَيۡنَ أَيۡدِيهِمۡ وَمَا خَلۡفَهُمۡۖ وَلَا يُحِيطُونَ بِشَيۡءٖ مِّنۡ عِلۡمِهِۦٓ إِلَّا بِمَا شَآءَۚ وَسِعَ كُرۡسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلۡأَرۡضَۖ وَلَا يَـُٔودُهُۥ حِفۡظُهُمَاۚ وَهُوَ ٱلۡعَلِيُّ ٱلۡعَظِيمُ﴾", source: '[البقرة: 255]' }], mode: 'end', steps: 5, includeExtras: false }
  },
  {
    app: 'misk', v: 1, id: 'sample-en', sample: true, template: 'quiz', theme: 'fun', lang: 'en',
    title: 'Present Simple (English)', settings: { teams: false, timer: 20 },
    content: { shuffleQ: false, shuffleOpts: true, questions: [
      { q: 'She ___ to school every day.', options: ['goes', 'go', 'going', 'gone'], correct: 0 },
      { q: 'They ___ football on Fridays.', options: ['play', 'plays', 'playing', 'played'], correct: 0 },
      { q: 'He ___ not like coffee.', options: ['does', 'do', 'is', 'are'], correct: 0 }
    ] }
  }
);

window.MK.samples.push(
  {"app": "misk", "v": 1, "id": "sample-show", "sample": true, "template": "show", "theme": "seal", "title": "مسابقة: حديث النية", "settings": {"teams": false, "timer": 30}, "content": {"shuffleQ": false, "shuffleOpts": true, "lifelines": true, "questions": [{"q": "من راوي حديث «إنما الأعمال بالنيات»؟", "options": ["عمر بن الخطاب رضي الله عنه", "أبو هريرة رضي الله عنه", "عبد الله بن عباس رضي الله عنهما", "أنس بن مالك رضي الله عنه"], "correct": 0}, {"q": "ما محل النية؟", "options": ["القلب", "اللسان", "الجوارح", "العقل"], "correct": 0}, {"q": "ما معنى «الإخلاص»؟", "options": ["إرادة وجه الله تعالى بالعمل", "كثرة العمل", "إظهار العمل للناس", "ترك العمل"], "correct": 0}, {"q": "بمَ مثّل الحديث لاختلاف النيات؟", "options": ["الهجرة", "الصلاة", "الصيام", "الحج"], "correct": 0}, {"q": "حكم التلفظ بالنية في العبادات:", "options": ["لا يُشرع", "واجب", "ركن", "شرط"], "correct": 0}]}},
  {"app": "misk", "v": 1, "id": "sample-find", "sample": true, "template": "find", "theme": "rawda", "title": "مصطلحات النية (جد المطابق)", "settings": {"teams": false, "timer": 0}, "content": {"shuffle": true, "pairs": [{"a": "النية", "b": "عزم القلب على فعل العبادة"}, {"a": "الإخلاص", "b": "إرادة وجه الله بالعمل"}, {"a": "الهجرة", "b": "الانتقال من دار الكفر إلى دار الإسلام"}, {"a": "الرياء", "b": "أن يعمل ليراه الناس"}, {"a": "التقوى", "b": "امتثال الأوامر واجتناب النواهي"}, {"a": "العبادة", "b": "كل ما يحبه الله ويرضاه"}]}},
  {"app": "misk", "v": 1, "id": "sample-memory", "sample": true, "template": "memory", "theme": "fun", "title": "أركان الإسلام (أزواج الذاكرة)", "settings": {"teams": false, "timer": 0}, "content": {"pairs": [{"a": "الركن الأول", "b": "الشهادتان"}, {"a": "الركن الثاني", "b": "الصلاة"}, {"a": "الركن الثالث", "b": "الزكاة"}, {"a": "الركن الرابع", "b": "صوم رمضان"}, {"a": "الركن الخامس", "b": "الحج"}, {"a": "عماد الدين", "b": "الصلاة ✦"}]}},
  {"app": "misk", "v": 1, "id": "sample-order", "sample": true, "template": "order", "theme": "waha", "title": "ترتيب أفعال الوضوء", "settings": {"teams": false, "timer": 0}, "content": {"shuffle": false, "lists": [{"q": "رتّب أفعال الوضوء", "items": ["النية", "غسل الوجه مع المضمضة والاستنشاق", "غسل اليدين إلى المرفقين", "مسح الرأس مع الأذنين", "غسل الرجلين إلى الكعبين"]}, {"q": "رتّب مراتب الدين من الأدنى إلى الأعلى", "items": ["الإسلام", "الإيمان", "الإحسان"]}]}},
  {"app": "misk", "v": 1, "id": "sample-group", "sample": true, "template": "group", "theme": "seal", "title": "أعمال القلب واللسان والجوارح", "settings": {"teams": false, "timer": 0}, "content": {"groups": [{"name": "أعمال القلب", "items": ["النية", "الإخلاص", "الخشية", "التوكل"]}, {"name": "أعمال اللسان", "items": ["الذكر", "الدعاء", "قول الصدق"]}, {"name": "أعمال الجوارح", "items": ["الصلاة", "الصدقة", "بر الوالدين"]}]}},
  {"app": "misk", "v": 1, "id": "sample-randcards", "sample": true, "template": "randcards", "theme": "rawda", "title": "أسئلة مراجعة سريعة (بطاقات عشوائية)", "settings": {"teams": false, "timer": 0}, "content": {"remove": true, "items": ["اذكر معنى النية", "من راوي حديث النية؟", "ما الفرق بين النية والإخلاص؟", "اذكر مثالًا لعمل عادي يصير عبادة بالنية", "ما خطر الرياء؟", "كيف تجدّد نيتك قبل المذاكرة؟", "ما محل النية؟", "اذكر فائدة من الحديث"]}},
  {"app": "misk", "v": 1, "id": "sample-tiles", "sample": true, "template": "tiles", "theme": "waha", "title": "مصطلحات الدرس (بلاطات منقلبة)", "settings": {"teams": false, "timer": 0}, "content": {"cards": [{"front": "النية", "back": "عزم القلب على فعل العبادة تقربًا إلى الله"}, {"front": "الإخلاص", "back": "إرادة وجه الله تعالى بالعمل"}, {"front": "الهجرة", "back": "الانتقال من دار الكفر إلى دار الإسلام"}, {"front": "الرياء", "back": "أن يعمل العمل ليراه الناس"}, {"front": "العمل", "back": "كل ما يصدر عن الإنسان من قول أو فعل"}, {"front": "الجزاء", "back": "بحسب النية"}]}},
  {"app": "misk", "v": 1, "id": "sample-talk", "sample": true, "template": "talk", "theme": "fun", "title": "نقاش: النية في حياتنا", "settings": {"teams": false, "timer": 0}, "content": {"talkTime": 60, "items": ["كيف تجعل نومك عبادة؟", "موقف شعرت فيه أن نيتك تغيّرت أثناء العمل، ماذا فعلت؟", "لماذا لا يطّلع على النية إلا الله؟", "كيف تتعامل مع حب ثناء الناس؟", "ما النية التي تحملها وأنت تأتي إلى المدرسة؟", "لو عملتَ عملًا صالحًا ولم يره أحد، كيف تشعر؟"]}},
  {"app": "misk", "v": 1, "id": "sample-diagram", "sample": true, "template": "diagram", "theme": "rawda", "title": "أجزاء النبات (علوم)", "settings": {"teams": false, "timer": 0}, "content": {"image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNTYwIiB2aWV3Qm94PSIwIDAgODAwIDU2MCI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI1NjAiIGZpbGw9IiNmNGY5ZWYiLz48cmVjdCB5PSI0MDAiIHdpZHRoPSI4MDAiIGhlaWdodD0iMTYwIiBmaWxsPSIjYzlhNzdhIi8+PHJlY3QgeT0iNDAwIiB3aWR0aD0iODAwIiBoZWlnaHQ9IjE0IiBmaWxsPSIjYTg4NDVhIi8+PGcgc3Ryb2tlPSIjOGE2NDQwIiBzdHJva2Utd2lkdGg9IjciIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PHBhdGggZD0iTTQwMCA0MTAgQzM5MCA0NTAgMzYwIDQ3MCAzMzAgNTAwIi8+PHBhdGggZD0iTTQwMCA0MTAgQzQxMCA0NTUgNDQwIDQ3NSA0NzAgNTEwIi8+PHBhdGggZD0iTTQwMCA0MTAgTDQwMCA1MjAiLz48cGF0aCBkPSJNMzcwIDQ3MCBDMzUwIDQ4MCAzMzAgNDc4IDMxMCA0NzAiLz48cGF0aCBkPSJNNDMwIDQ3MCBDNDUwIDQ4NSA0NzUgNDg1IDQ5NSA0NzgiLz48L2c+PHBhdGggZD0iTTQwMCA0MTAgQzM5OCAzMzAgNDA0IDI1MCA0MDAgMTcwIiBzdHJva2U9IiMzZjhhM2EiIHN0cm9rZS13aWR0aD0iMTQiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik00MDAgMzIwIEMzNDAgMjkwIDI5MCAzMDAgMjUwIDMzMCBDMzAwIDM1MCAzNTAgMzQ1IDQwMCAzMjBaIiBmaWxsPSIjNWFhNjRhIi8+PHBhdGggZD0iTTQwMCAyNjAgQzQ2MCAyMjUgNTIwIDIzNSA1NTUgMjYwIEM1MTAgMjg1IDQ1NSAyODUgNDAwIDI2MFoiIGZpbGw9IiM1YWE2NGEiLz48cGF0aCBkPSJNNDAyIDMwMCBMMjcwIDMyOCIgc3Ryb2tlPSIjM2Y4YTNhIiBzdHJva2Utd2lkdGg9IjMiLz48cGF0aCBkPSJNNDAyIDI1NSBMNTQwIDI2MCIgc3Ryb2tlPSIjM2Y4YTNhIiBzdHJva2Utd2lkdGg9IjMiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MDAgMTQwKSI+PGcgZmlsbD0iI2U4NWE3YSI+PGVsbGlwc2Ugcng9IjI2IiByeT0iNDgiIHRyYW5zZm9ybT0icm90YXRlKDApIHRyYW5zbGF0ZSgwIC00MikiLz48ZWxsaXBzZSByeD0iMjYiIHJ5PSI0OCIgdHJhbnNmb3JtPSJyb3RhdGUoNzIpIHRyYW5zbGF0ZSgwIC00MikiLz48ZWxsaXBzZSByeD0iMjYiIHJ5PSI0OCIgdHJhbnNmb3JtPSJyb3RhdGUoMTQ0KSB0cmFuc2xhdGUoMCAtNDIpIi8+PGVsbGlwc2Ugcng9IjI2IiByeT0iNDgiIHRyYW5zZm9ybT0icm90YXRlKDIxNikgdHJhbnNsYXRlKDAgLTQyKSIvPjxlbGxpcHNlIHJ4PSIyNiIgcnk9IjQ4IiB0cmFuc2Zvcm09InJvdGF0ZSgyODgpIHRyYW5zbGF0ZSgwIC00MikiLz48L2c+PGNpcmNsZSByPSIyNCIgZmlsbD0iI2Y2YzM0MyIvPjwvZz48Y2lyY2xlIGN4PSI2NjAiIGN5PSI4MCIgcj0iNDQiIGZpbGw9IiNmNmMzNDMiIG9wYWNpdHk9Ii44Ii8+PC9zdmc+Cg==", "labels": [{"text": "الزهرة", "x": 50, "y": 25}, {"text": "الورقة", "x": 67, "y": 46}, {"text": "الساق", "x": 50, "y": 66}, {"text": "الجذور", "x": 50, "y": 88}]}},
  {"app": "misk", "v": 1, "id": "sample-crossword", "sample": true, "template": "crossword", "theme": "seal", "title": "كلمات متقاطعة: حديث النية", "settings": {"teams": false, "timer": 0}, "content": {"pairs": [{"a": "إرادة وجه الله تعالى بالعمل", "b": "الإخلاص"}, {"a": "عزم القلب على فعل العبادة", "b": "النية"}, {"a": "الانتقال من دار الكفر إلى دار الإسلام", "b": "الهجرة"}, {"a": "محل النية", "b": "القلب"}, {"a": "أن يعمل ليراه الناس", "b": "الرياء"}, {"a": "«إنما ... بالنيات»", "b": "الأعمال"}]}},
  {"app": "misk", "v": 1, "id": "sample-wordsearch", "sample": true, "template": "wordsearch", "theme": "waha", "title": "ابحث عن كلمات الدرس", "settings": {"teams": false, "timer": 0}, "content": {"diag": false, "reverse": false, "showList": true, "words": ["نية", "إخلاص", "هجرة", "عمل", "قلب", "عبادة", "صدق", "تقوى"]}}
);

window.MK.samples.push(
  {"app": "misk", "v": 1, "id": "sample-whack", "sample": true, "template": "whack", "theme": "fun", "title": "اضرب الخلد: حديث النية", "settings": {"teams": false, "timer": 0}, "content": {"questions": [{"q": "من راوي حديث «إنما الأعمال بالنيات»؟", "options": ["عمر بن الخطاب", "أبو هريرة", "ابن عباس", "أنس بن مالك"], "correct": 0}, {"q": "ما محل النية؟", "options": ["القلب", "اللسان", "اليد", "العين"], "correct": 0}, {"q": "ضد الإخلاص:", "options": ["الرياء", "الصدق", "التقوى", "الصبر"], "correct": 0}, {"q": "بمَ مثّل الحديث لاختلاف النيات؟", "options": ["الهجرة", "الصلاة", "الصيام", "الزكاة"], "correct": 0}], "shuffleQ": true, "speed": 2, "lives": 3}, "kind": "kht", "goal": "أن يتذكر الطالب معلومات الحديث الأساسية"},
  {"app": "misk", "v": 1, "id": "sample-balloon", "sample": true, "template": "balloon", "theme": "rawda", "title": "فرقعة البالونات: مصطلحات النية", "settings": {"teams": false, "timer": 0}, "content": {"pairs": [{"a": "النية", "b": "عزم القلب على فعل العبادة"}, {"a": "الإخلاص", "b": "إرادة وجه الله بالعمل"}, {"a": "الهجرة", "b": "الانتقال من دار الكفر إلى دار الإسلام"}, {"a": "الرياء", "b": "أن يعمل ليراه الناس"}], "speed": 2, "lives": 3}, "kind": "bin", "goal": "أن يربط الطالب المصطلح بمعناه"},
  {"app": "misk", "v": 1, "id": "sample-maze", "sample": true, "template": "maze", "theme": "seal", "title": "مطاردة المتاهة: حديث النية", "settings": {"teams": false, "timer": 0}, "content": {"questions": [{"q": "من راوي حديث «إنما الأعمال بالنيات»؟", "options": ["عمر بن الخطاب", "أبو هريرة", "ابن عباس", "أنس بن مالك"], "correct": 0}, {"q": "ما محل النية؟", "options": ["القلب", "اللسان", "اليد", "العين"], "correct": 0}, {"q": "ضد الإخلاص:", "options": ["الرياء", "الصدق", "التقوى", "الصبر"], "correct": 0}, {"q": "بمَ مثّل الحديث لاختلاف النيات؟", "options": ["الهجرة", "الصلاة", "الصيام", "الزكاة"], "correct": 0}], "shuffleQ": true, "speed": 2, "lives": 3}, "kind": "kht", "goal": "أن يتذكر الطالب معلومات الحديث الأساسية"},
  {"app": "misk", "v": 1, "id": "sample-plane", "sample": true, "template": "plane", "theme": "waha", "title": "الطائرة: حديث النية", "settings": {"teams": false, "timer": 0}, "content": {"questions": [{"q": "من راوي حديث «إنما الأعمال بالنيات»؟", "options": ["عمر بن الخطاب", "أبو هريرة", "ابن عباس", "أنس بن مالك"], "correct": 0}, {"q": "ما محل النية؟", "options": ["القلب", "اللسان", "اليد", "العين"], "correct": 0}, {"q": "ضد الإخلاص:", "options": ["الرياء", "الصدق", "التقوى", "الصبر"], "correct": 0}, {"q": "بمَ مثّل الحديث لاختلاف النيات؟", "options": ["الهجرة", "الصلاة", "الصيام", "الزكاة"], "correct": 0}], "shuffleQ": true, "speed": 2, "lives": 3}, "kind": "kht"},
  {"app": "misk", "v": 1, "id": "sample-fruit", "sample": true, "template": "fruit", "theme": "fun", "title": "الفاكهة الطائرة: حديث النية", "settings": {"teams": false, "timer": 0}, "content": {"questions": [{"q": "من راوي حديث «إنما الأعمال بالنيات»؟", "options": ["عمر بن الخطاب", "أبو هريرة", "ابن عباس", "أنس بن مالك"], "correct": 0}, {"q": "ما محل النية؟", "options": ["القلب", "اللسان", "اليد", "العين"], "correct": 0}, {"q": "ضد الإخلاص:", "options": ["الرياء", "الصدق", "التقوى", "الصبر"], "correct": 0}, {"q": "بمَ مثّل الحديث لاختلاف النيات؟", "options": ["الهجرة", "الصلاة", "الصيام", "الزكاة"], "correct": 0}], "shuffleQ": true, "speed": 2, "lives": 3}, "kind": "tah", "goal": "أن يستحضر الطالب ما يعرفه عن النية"},
  {"app": "misk", "v": 1, "id": "sample-speedsort", "sample": true, "template": "speedsort", "theme": "rawda", "title": "التصنيف السريع: أعمال القلب والجوارح", "settings": {"teams": false, "timer": 0}, "content": {"groups": [{"name": "أعمال القلب", "items": ["النية", "الإخلاص", "الخشية", "التوكل", "الرجاء"]}, {"name": "أعمال الجوارح", "items": ["الصلاة", "الصدقة", "الصيام", "بر الوالدين", "الحج"]}], "speed": 2, "lives": 3}, "kind": "bin", "goal": "أن يميّز الطالب أعمال القلب من أعمال الجوارح"}
);
// نوع النشاط والهدف لبعض الأمثلة
(function () { var K = { 'sample-show': ['kht', 'أن يحدد الطالب راوي الحديث ومحل النية'], 'sample-order': ['bin', 'أن يرتب الطالب أفعال الوضوء'], 'sample-group': ['bin', 'أن يصنّف الطالب الأعمال إلى قلبية ولسانية وبدنية'], 'sample-talk': ['tah', 'أن يربط الطالب النية بحياته اليومية'], 'sample-crossword': ['kht', 'أن يتذكر الطالب مصطلحات الدرس'], 'sample-randcards': ['kht', 'أن يراجع الطالب الدرس'] };
  window.MK.samples.forEach(function (s) { var k = K[s.id]; if (k && !s.kind) { s.kind = k[0]; s.goal = k[1]; } }); })();

window.MK.samples.unshift({"app": "misk", "v": 1, "id": "sample-board", "sample": true, "template": "board", "theme": "seal", "title": "مراجعة الفصل: لوحة التحديات", "kind": "kht", "goal": "أن يراجع الطالب أهم معارف الفصل في المجالات الخمسة", "settings": {"teams": true, "timer": 30}, "content": {"colType": "domains", "vals": "a", "guide": false, "cols": [{"name": "القرآن الكريم", "cells": [{"q": "كم عدد سور القرآن الكريم؟", "a": "114 سورة"}, {"q": "ما أطول سورة في القرآن الكريم؟", "a": "سورة البقرة"}, {"q": "ما السورة التي تعدل ثلث القرآن؟", "a": "سورة الإخلاص"}, {"q": "ما أول ما نزل من القرآن الكريم؟", "a": "أول سورة العلق: ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾"}]}, {"name": "الحديث الشريف", "cells": [{"q": "من راوي حديث «إنما الأعمال بالنيات»؟", "a": "عمر بن الخطاب رضي الله عنه"}, {"q": "ما تعريف الحديث الشريف؟", "a": "ما أُضيف إلى النبي ﷺ من قول أو فعل أو تقرير أو صفة"}, {"q": "أكمل: «من حسن إسلام المرء …»", "a": "«… تركُه ما لا يعنيه»"}, {"q": "من أكثر الصحابة رواية للحديث؟", "a": "أبو هريرة رضي الله عنه"}]}, {"name": "العقيدة", "cells": [{"q": "كم عدد أركان الإيمان؟", "a": "ستة"}, {"q": "ما الركن الأول من أركان الإيمان؟", "a": "الإيمان بالله"}, {"q": "ما معنى التوحيد؟", "a": "إفراد الله تعالى بالعبادة"}, {"q": "ما أعلى مراتب الدين؟", "a": "الإحسان"}]}, {"name": "الفقه", "cells": [{"q": "كم عدد الصلوات المفروضة في اليوم والليلة؟", "a": "خمس صلوات"}, {"q": "كم عدد ركعات صلاة المغرب؟", "a": "ثلاث ركعات"}, {"q": "ما حكم الوضوء لصلاة الفريضة؟", "a": "شرط لصحتها"}, {"q": "كم نصاب زكاة الذهب تقريبًا؟", "a": "85 جرامًا"}]}, {"name": "السيرة النبوية", "cells": [{"q": "في أي مدينة وُلد النبي ﷺ؟", "a": "مكة المكرمة"}, {"q": "ما اسم أم النبي ﷺ؟", "a": "آمنة بنت وهب"}, {"q": "في أي عام وُلد النبي ﷺ؟", "a": "عام الفيل"}, {"q": "ما أول غزوة كبرى في الإسلام؟", "a": "غزوة بدر الكبرى"}]}]}});
