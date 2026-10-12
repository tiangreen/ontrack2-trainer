import type { VocabEntry, VocabTopic, WorkshopId } from '../types';

type Row = [en: string, de: string, example?: string];

const slug = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function make(workshop: WorkshopId, topic: VocabTopic, rows: Row[]): VocabEntry[] {
  const ws = workshop.toLowerCase();
  return rows.map(([en, de, example]) => ({
    id: `${ws}-${topic}-${slug(en)}`,
    en,
    de,
    workshop,
    topic,
    ...(example ? { example } : {}),
  }));
}

// ---------- Workshop 1 ----------

const w1Feelings: Row[] = [
  ['happy', 'glücklich / froh', 'I am happy about my new bike.'],
  ['sad', 'traurig'],
  ['angry', 'wütend / verärgert', 'Dad was angry because the window was broken.'],
  ['afraid (of)', 'ängstlich / bange (vor)'],
  ['to be scared (of)', 'Angst haben (vor)', 'My little sister is scared of spiders.'],
  ['nervous', 'nervös', 'I am nervous before a test.'],
  ['excited', 'aufgeregt / begeistert'],
  ['bored', 'gelangweilt', 'He was bored in the long lesson.'],
  ['lonely', 'einsam'],
  ['proud (of)', 'stolz (auf)', 'Mum is proud of me.'],
  ['jealous (of)', 'eifersüchtig / neidisch (auf)'],
  ['surprised', 'überrascht', 'We were surprised by the big party.'],
  ['tired', 'müde'],
  ['worried (about)', 'besorgt (wegen)', 'Tom is worried about the maths test.'],
  ['embarrassed', 'beschämt / verlegen'],
  ['relaxed', 'entspannt', 'After the swim I felt relaxed.'],
  ['cheerful', 'fröhlich / heiter'],
  ['shy', 'schüchtern'],
  ['upset', 'durcheinander / aufgebracht', 'She was upset because she lost her phone.'],
  ['to feel', 'sich fühlen / fühlen'],
  ['to be in a good mood', 'gute Laune haben', 'Why are you in a good mood today?'],
  ['disappointed', 'enttäuscht'],
];

const w1PlansJobs: Row[] = [
  ['plan', 'der Plan / das Vorhaben', 'My plan for Saturday is to go swimming.'],
  ['to plan', 'planen'],
  ['to hope', 'hoffen', 'I hope the sun will shine tomorrow.'],
  ['future', 'die Zukunft'],
  ['job', 'der Job / die Arbeitsstelle'],
  ['to want to be', 'werden wollen', 'I want to be a vet.'],
  ['doctor', 'der Arzt / die Ärztin'],
  ['vet', 'der Tierarzt / die Tierärztin'],
  ['pilot', 'der Pilot / die Pilotin'],
  ['police officer', 'der Polizist / die Polizistin', 'A police officer helps people in danger.'],
  ['firefighter', 'der Feuerwehrmann / die Feuerwehrfrau'],
  ['engineer', 'der Ingenieur / die Ingenieurin'],
  ['to decide', 'sich entscheiden / beschließen', 'I decided to learn the guitar.'],
  ['to dream of', 'träumen von'],
  ['to save money', 'Geld sparen', 'I am saving money for a new tablet.'],
  ['weekend', 'das Wochenende'],
  ['holiday', 'der Urlaub / die Ferien'],
  ['to invite', 'einladen', 'I am going to invite ten friends.'],
  ['tomorrow', 'morgen'],
  ['next week', 'nächste Woche'],
];

const w1Weather: Row[] = [
  ['weather', 'das Wetter'],
  ['weather forecast', 'der Wetterbericht / die Wettervorhersage', 'The weather forecast says it will rain.'],
  ['sunny', 'sonnig'],
  ['cloudy', 'wolkig / bewölkt'],
  ['windy', 'windig', 'It is too windy to fly a kite.'],
  ['rainy', 'regnerisch'],
  ['foggy', 'neblig'],
  ['stormy', 'stürmisch'],
  ['snowy', 'verschneit / schneereich'],
  ['thunderstorm', 'das Gewitter', 'There will be a thunderstorm tonight.'],
  ['temperature', 'die Temperatur'],
  ['degree', 'der Grad', 'It is twenty degrees today.'],
  ['to shine', 'scheinen', 'The sun shines in the morning.'],
  ['to freeze', 'frieren / gefrieren'],
  ['ice', 'das Eis (gefroren)', 'The lake is covered with ice.'],
  ['cold', 'kalt'],
  ['hot', 'heiß'],
  ['warm', 'warm'],
  ['dry', 'trocken'],
  ['wet', 'nass', 'My shoes are wet.'],
  ['umbrella', 'der Regenschirm'],
  ['sky', 'der Himmel'],
];

const w1Town: Row[] = [
  ['town', 'die Stadt (klein) / der Ort'],
  ['city', 'die (Groß-)Stadt', 'London is a big city.'],
  ['shopping centre', 'das Einkaufszentrum'],
  ['library', 'die Bibliothek / die Bücherei'],
  ['museum', 'das Museum', 'We are going to visit the museum on Friday.'],
  ['swimming pool', 'das Schwimmbad'],
  ['station', 'der Bahnhof / die Station'],
  ['bus stop', 'die Bushaltestelle'],
  ['bridge', 'die Brücke'],
  ['market', 'der Markt', 'We buy fruit at the market.'],
  ['church', 'die Kirche'],
  ['cinema', 'das Kino'],
  ['playground', 'der Spielplatz'],
  ['park', 'der Park'],
  ['street', 'die Straße', 'There is a bakery in our street.'],
  ['square', 'der Platz'],
  ['corner', 'die Ecke'],
  ['traffic', 'der Verkehr'],
  ['crowded', 'überfüllt / voll'],
  ['quiet', 'ruhig / leise'],
];

const w1Adjectives: Row[] = [
  ['cheap', 'billig / günstig', 'This T-shirt is cheaper than that one.'],
  ['expensive', 'teuer'],
  ['big / large', 'groß'],
  ['small', 'klein'],
  ['tall', 'groß (Mensch, Gebäude)'],
  ['short', 'kurz / klein (Mensch)'],
  ['long', 'lang', 'The Thames is a long river.'],
  ['fast', 'schnell'],
  ['slow', 'langsam'],
  ['easy', 'leicht / einfach'],
  ['difficult / hard', 'schwierig / schwer', 'English is not as difficult as I thought.'],
  ['old', 'alt'],
  ['young', 'jung'],
  ['new', 'neu'],
  ['heavy', 'schwer (Gewicht)'],
  ['light', 'leicht (Gewicht) / hell'],
  ['dangerous', 'gefährlich', 'Skiing is more dangerous than walking.'],
  ['safe', 'sicher'],
  ['strong', 'stark'],
  ['weak', 'schwach'],
  ['clever / smart', 'klug / schlau'],
  ['boring', 'langweilig'],
  ['interesting', 'interessant', 'This book is the most interesting one I know.'],
  ['famous', 'berühmt'],
  ['dirty', 'schmutzig'],
  ['clean', 'sauber'],
];

// ---------- Workshop 2 ----------

const w2History: Row[] = [
  ['history', 'die Geschichte (Vergangenheit)', 'We learn about history at school.'],
  ['castle', 'die Burg / das Schloss'],
  ['king', 'der König'],
  ['queen', 'die Königin', 'Queen Victoria ruled for a long time.'],
  ['prince', 'der Prinz'],
  ['princess', 'die Prinzessin'],
  ['century', 'das Jahrhundert', 'The castle is from the 12th century.'],
  ['soldier', 'der Soldat / die Soldatin'],
  ['battle', 'die Schlacht'],
  ['war', 'der Krieg'],
  ['to rule', 'herrschen / regieren', 'The king ruled the country for forty years.'],
  ['to fight', 'kämpfen'],
  ['knight', 'der Ritter'],
  ['sword', 'das Schwert'],
  ['armour', 'die Rüstung'],
  ['empire', 'das Reich / das Imperium'],
  ['Romans', 'die Römer', 'The Romans built roads all over Europe.'],
  ['to invade', 'einmarschieren / erobern'],
  ['ancient', 'uralt / antik'],
  ['to build', 'bauen', 'They built the wall in only ten years.'],
  ['to discover', 'entdecken'],
  ['past', 'die Vergangenheit'],
  ['ruins', 'die Ruinen'],
];

const w2Travel: Row[] = [
  ['sights', 'die Sehenswürdigkeiten', 'We saw all the sights in London.'],
  ['tourist', 'der Tourist / die Touristin'],
  ['trip', 'der Ausflug / die Reise'],
  ['journey', 'die Reise / die Fahrt'],
  ['to visit', 'besuchen / besichtigen', 'Have you ever visited Edinburgh?'],
  ['guide', 'der Führer / die Führerin'],
  ['tower', 'der Turm'],
  ['palace', 'der Palast'],
  ['souvenir', 'das Andenken / das Souvenir'],
  ['postcard', 'die Postkarte', 'I have just written a postcard to Gran.'],
  ['ticket', 'die Eintrittskarte / das Ticket'],
  ['luggage', 'das Gepäck'],
  ['hotel', 'das Hotel'],
  ['to travel', 'reisen'],
  ['abroad', 'im Ausland / ins Ausland'],
  ['map', 'die Landkarte / der Stadtplan'],
  ['to take photos', 'Fotos machen', 'We took lots of photos of the bridge.'],
  ['airport', 'der Flughafen'],
  ['to book', 'buchen / reservieren'],
];

const w2Health: Row[] = [
  ['health', 'die Gesundheit'],
  ['headache', 'die Kopfschmerzen', 'I have a headache.'],
  ['stomach-ache', 'die Bauchschmerzen'],
  ['toothache', 'die Zahnschmerzen'],
  ['sore throat', 'die Halsschmerzen'],
  ['cold (illness)', 'die Erkältung / der Schnupfen'],
  ['fever', 'das Fieber', 'He has a fever and must stay in bed.'],
  ['to cough', 'husten'],
  ['to hurt', 'wehtun / verletzen', 'My leg hurts.'],
  ['ill / sick', 'krank'],
  ['medicine', 'die Medizin / das Medikament', 'You should take the medicine twice a day.'],
  ['to break a leg', 'sich das Bein brechen'],
  ['plaster', 'das Pflaster'],
  ['hospital', 'das Krankenhaus'],
  ['dentist', 'der Zahnarzt / die Zahnärztin'],
  ['to rest', 'sich ausruhen', 'You should rest for a few days.'],
  ['healthy', 'gesund'],
  ['accident', 'der Unfall'],
  ['bandage', 'der Verband'],
  ['to feel better', 'sich besser fühlen'],
];

const w2Rules: Row[] = [
  ['rule', 'die Regel', 'There is a rule against running in the corridor.'],
  ['allowed', 'erlaubt'],
  ['to be allowed to', 'dürfen / die Erlaubnis haben', 'We are not allowed to use phones in class.'],
  ['permission', 'die Erlaubnis'],
  ['to ask for permission', 'um Erlaubnis bitten'],
  ['forbidden', 'verboten'],
  ['to be able to', 'können / in der Lage sein', 'I wasn\u2019t able to finish my homework.'],
  ['to have to', 'müssen'],
  ['advice', 'der Rat / die Ratschläge', 'Can I give you some advice?'],
  ['to advise', 'raten / empfehlen'],
  ['possible', 'möglich'],
  ['impossible', 'unmöglich'],
  ['perhaps / maybe', 'vielleicht', 'Maybe we can play outside later.'],
  ['polite', 'höflich'],
  ['to allow', 'erlauben'],
];

export const starterVocab: VocabEntry[] = [
  // W1
  ...make('W1', 'feelings', w1Feelings),
  ...make('W1', 'plans-jobs', w1PlansJobs),
  ...make('W1', 'weather', w1Weather),
  ...make('W1', 'town-places', w1Town),
  ...make('W1', 'adjectives', w1Adjectives),
  // W2
  ...make('W2', 'history', w2History),
  ...make('W2', 'travel-sights', w2Travel),
  ...make('W2', 'health', w2Health),
  ...make('W2', 'rules-permission', w2Rules),
];
