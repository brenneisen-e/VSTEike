// names.js - Deutsche Namen fÃ¼r Vermittler

const vornamen = [
    // MÃ¤nnlich
    'Eike', 'Alexander', 'Andreas', 'Bernd', 'Christian', 'Daniel', 'David', 'Dirk',
    'Felix', 'Florian', 'Frank', 'Georg', 'Hans', 'Heinrich', 'Holger', 'Jan',
    'Jens', 'Joachim', 'Johannes', 'JÃ¶rg', 'Julian', 'JÃ¼rgen', 'Karl', 'Klaus',
    'Lars', 'Lukas', 'Manfred', 'Manuel', 'Marco', 'Markus', 'Martin', 'Matthias',
    'Max', 'Maximilian', 'Michael', 'Moritz', 'Niklas', 'Oliver', 'Patrick', 'Paul',
    'Peter', 'Philipp', 'Rafael', 'Ralf', 'Robert', 'Roland', 'Sebastian', 'Stefan',
    'Steffen', 'Sven', 'Thomas', 'Thorsten', 'Tim', 'Tobias', 'Uwe', 'Werner',
    'Wolfgang', 'Rainer', 'Dieter', 'GÃ¼nter', 'Helmut', 'Horst',
    
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
    'Brenneisen', 'MÃ¼ller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner',
    'Becker', 'Schulz', 'Hoffmann', 'SchÃ¤fer', 'Koch', 'Bauer', 'Richter', 'Klein',
    'Wolf', 'SchrÃ¶der', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'KrÃ¼ger', 'Hofmann',
    'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier', 'Lehmann',
    'Schmid', 'Schulze', 'Maier', 'KÃ¶hler', 'Herrmann', 'KÃ¶nig', 'Walter', 'Mayer',
    'Huber', 'Kaiser', 'Fuchs', 'Peters', 'Lang', 'Scholz', 'MÃ¶ller', 'WeiÃŸ',
    'Jung', 'Hahn', 'Schubert', 'Vogel', 'Friedrich', 'Keller', 'GÃ¼nther', 'Frank',
    'Berger', 'Winkler', 'Roth', 'Beck', 'Lorenz', 'Baumann', 'Franke', 'Albrecht',
    'Schuster', 'Simon', 'Ludwig', 'BÃ¶hm', 'Winter', 'Kraus', 'Martin', 'Schumacher',
    'KrÃ¤mer', 'Vogt', 'Stein', 'JÃ¤ger', 'Otto', 'Sommer', 'GroÃŸ', 'Seidel',
    'Heinrich', 'Brandt', 'Haas', 'Schreiber', 'Graf', 'Dietrich', 'Ziegler', 'Kuhn',
    'KÃ¼hn', 'Pohl', 'Engel', 'Horn', 'Busch', 'Bergmann', 'Thomas', 'Voigt',
    'Sauer', 'Arnold', 'Wolff', 'Pfeiffer', 'Lindemann', 'Rademacher', 'Kuhlmann', 'Ebert',
    'Ackermann', 'Reimann', 'Hansen', 'Seifert', 'Bachmann', 'Beckmann', 'Bender', 'BÃ¶hme'
];

// Funktion um einen zufÃ¤lligen Namen zu generieren
function generateRandomName() {
    const vorname = vornamen[Math.floor(Math.random() * vornamen.length)];
    const nachname = nachnamen[Math.floor(Math.random() * nachnamen.length)];
    return `${vorname} ${nachname}`;
}

// Funktion um eine Liste eindeutiger Namen zu generieren
function generateUniqueNames(count) {
    const names = new Set();
    
    // Eike Brenneisen als ersten Namen hinzufÃ¼gen
    names.add('Eike Brenneisen');
    
    // Weitere Namen generieren bis wir die gewÃ¼nschte Anzahl haben
    let attempts = 0;
    const maxAttempts = count * 10; // Sicherheitsgrenze
    
    while (names.size < count && attempts < maxAttempts) {
        names.add(generateRandomName());
        attempts++;
    }
    
    // Falls wir nicht genug eindeutige Namen generieren konnten, 
    // fÃ¼gen wir nummerierte Namen hinzu
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