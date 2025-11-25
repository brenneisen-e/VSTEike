// names.js - Deutsche Namen für Vermittler

const vornamen = [
    // Männlich
    'Eike', 'Alexander', 'Andreas', 'Bernd', 'Christian', 'Daniel', 'David', 'Dirk',
    'Felix', 'Florian', 'Frank', 'Georg', 'Hans', 'Heinrich', 'Holger', 'Jan',
    'Jens', 'Joachim', 'Johannes', 'Jörg', 'Julian', 'Jürgen', 'Karl', 'Klaus',
    'Lars', 'Lukas', 'Manfred', 'Manuel', 'Marco', 'Markus', 'Martin', 'Matthias',
    'Max', 'Maximilian', 'Michael', 'Moritz', 'Niklas', 'Oliver', 'Patrick', 'Paul',
    'Peter', 'Philipp', 'Rafael', 'Ralf', 'Robert', 'Roland', 'Sebastian', 'Stefan',
    'Steffen', 'Sven', 'Thomas', 'Thorsten', 'Tim', 'Tobias', 'Uwe', 'Werner',
    'Wolfgang', 'Rainer', 'Dieter', 'Günter', 'Helmut', 'Horst',

    // Weiblich
    'Anna', 'Andrea', 'Angelika', 'Anja', 'Anke', 'Anne', 'Astrid', 'Barbara',
    'Beate', 'Birgit', 'Brigitte', 'Carmen', 'Cathrin', 'Christa', 'Christina', 'Christine',
    'Claudia', 'Daniela', 'Doris', 'Elena', 'Elisabeth', 'Elke', 'Emma', 'Eva',
    'Gabriele', 'Gisela', 'Hanna', 'Heike', 'Helga', 'Hildegard', 'Ines', 'Inge',
    'Ingrid', 'Jana', 'Jennifer', 'Jessica', 'Julia', 'Jutta', 'Karin', 'Katharina',
    'Kathrin', 'Katja', 'Kerstin', 'Laura', 'Lea', 'Lena', 'Lisa', 'Magdalena',
    'Manuela', 'Maria', 'Marie', 'Marina', 'Marion', 'Martina', 'Melanie', 'Monika',
    'Nadine', 'Nicole', 'Petra', 'Renate', 'Rita', 'Sabine', 'Sandra', 'Sara',
    'Silke', 'Simone', 'Stefanie', 'Susanne', 'Tanja', 'Ursula', 'Ute', 'Vanessa'
];

const nachnamen = [
    'Brenneisen', 'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner',
    'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein',
    'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann',
    'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier', 'Lehmann',
    'Schmid', 'Schulze', 'Maier', 'Köhler', 'Herrmann', 'König', 'Walter', 'Mayer',
    'Huber', 'Kaiser', 'Fuchs', 'Peters', 'Lang', 'Scholz', 'Möller', 'Weiß',
    'Jung', 'Hahn', 'Schubert', 'Vogel', 'Friedrich', 'Keller', 'Günther', 'Frank',
    'Berger', 'Winkler', 'Roth', 'Beck', 'Lorenz', 'Baumann', 'Franke', 'Albrecht',
    'Schuster', 'Simon', 'Ludwig', 'Böhm', 'Winter', 'Kraus', 'Martin', 'Schumacher',
    'Krämer', 'Vogt', 'Stein', 'Jäger', 'Otto', 'Sommer', 'Groß', 'Seidel',
    'Heinrich', 'Brandt', 'Haas', 'Schreiber', 'Graf', 'Dietrich', 'Ziegler', 'Kuhn',
    'Kühn', 'Pohl', 'Engel', 'Horn', 'Busch', 'Bergmann', 'Thomas', 'Voigt',
    'Sauer', 'Arnold', 'Wolff', 'Pfeiffer', 'Lindemann', 'Rademacher', 'Kuhlmann', 'Ebert',
    'Ackermann', 'Reimann', 'Hansen', 'Seifert', 'Bachmann', 'Beckmann', 'Bender', 'Böhme'
];

// Funktion um einen zufälligen Namen zu generieren
function generateRandomName() {
    const vorname = vornamen[Math.floor(Math.random() * vornamen.length)];
    const nachname = nachnamen[Math.floor(Math.random() * nachnamen.length)];
    return `${vorname} ${nachname}`;
}

// Funktion um eine Liste eindeutiger Namen zu generieren
function generateUniqueNames(count) {
    const names = new Set();

    // Max Mustermann als ersten Namen hinzufügen
    names.add('Max Mustermann');

    // Weitere Namen generieren bis wir die gewünschte Anzahl haben
    let attempts = 0;
    const maxAttempts = count * 10; // Sicherheitsgrenze

    while (names.size < count && attempts < maxAttempts) {
        names.add(generateRandomName());
        attempts++;
    }

    // Falls wir nicht genug eindeutige Namen generieren konnten,
    // fügen wir nummerierte Namen hinzu
    if (names.size < count) {
        let counter = 1;
        while (names.size < count) {
            const vorname = vornamen[Math.floor(Math.random() * vornamen.length)];
            const nachname = nachnamen[Math.floor(Math.random() * nachnamen.length)];
            names.add(`${vorname} ${nachname} ${counter}`);
            counter++;
        }
    }

    return Array.from(names);
}
