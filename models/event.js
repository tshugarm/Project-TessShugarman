const { v4: uuidv4 } = require('uuid');

// Array to store all events (mimicking a database)
const events = [
    {
        id: '1',
        category: 'Outdoor',
        title: 'Basketball Tournament',
        host: 'Basketball Association',
        startDateTime: '2025-08-15T10:00',
        endDateTime: '2025-08-15T14:00',
        details: 'Fast-paced basketball tournaments with singles and doubles competitions. Open to all skill levels with competitive brackets.',
        image: '/images/basketball.jpg'
    },
    {
        id: '2',
        category: 'Outdoor',
        title: 'Flag Football',
        host: 'Flag Football League',
        startDateTime: '2025-08-20T14:00',
        endDateTime: '2025-08-20T18:00',
        details: 'Non-contact football with all the excitement and strategy of the real game. Teams of 7 players compete in elimination rounds.',
        image: '/images/flag-football.jpg'
    },
    {
        id: '3',
        category: 'Outdoor',
        title: 'Soccer Games',
        host: 'Soccer Association',
        startDateTime: '2025-08-25T09:00',
        endDateTime: '2025-08-25T13:00',
        details: 'Outdoor soccer matches with skilled referees and competitive play. Championship match between top two teams of the season.',
        image: '/images/soccer.jpg'
    },
    {
        id: '4',
        category: 'Indoor',
        title: 'Volleyball League',
        host: 'Volleyball Club',
        startDateTime: '2025-08-18T11:00',
        endDateTime: '2025-08-18T15:00',
        details: 'Indoor volleyball leagues for all skill levels with weekly matches. Teams compete in round-robin format.',
        image: '/images/volleyball.jpg'
    },
    {
        id: '5',
        category: 'Indoor',
        title: 'Table Tennis Tourny',
        host: 'Ping Pong Society',
        startDateTime: '2025-08-22T16:00',
        endDateTime: '2025-08-22T20:00',
        details: 'Fast-paced ping pong tournaments with singles and doubles competitions. Open to beginners and advanced players.',
        image: '/images/table-tennis.jpg'
    },
    {
        id: '6',
        category: 'Indoor',
        title: 'Track & Field Meet',
        host: 'Athletics Club',
        startDateTime: '2025-08-28T08:00',
        endDateTime: '2025-08-28T12:00',
        details: 'Individual and team events including sprints, distance running, and field events. All athletic levels welcome.',
        image: '/images/track-field.jpg'
    }
];

// Get all events
exports.findAll = () => {
    return events;
};

// Get all distinct categories
exports.findAllCategories = () => {
    const categories = [...new Set(events.map(event => event.category))];
    return categories.sort();
};

// Find event by ID
exports.findById = (id) => {
    return events.find(event => event.id === id);
};

// Create new event
exports.create = (eventData) => {
    const newEvent = {
        id: uuidv4(),
        category: eventData.category,
        title: eventData.title,
        host: eventData.host,
        startDateTime: eventData.startDateTime,
        endDateTime: eventData.endDateTime,
        details: eventData.details,
        image: eventData.image || '/images/default-event.jpg'
    };
    events.push(newEvent);
    return newEvent;
};

// Update event by ID
exports.updateById = (id, eventData) => {
    const index = events.findIndex(event => event.id === id);
    if (index !== -1) {
        events[index] = {
            ...events[index],
            category: eventData.category,
            title: eventData.title,
            host: eventData.host,
            startDateTime: eventData.startDateTime,
            endDateTime: eventData.endDateTime,
            details: eventData.details,
            image: eventData.image || events[index].image
        };
        return events[index];
    }
    return null;
};

// Delete event by ID
exports.deleteById = (id) => {
    const index = events.findIndex(event => event.id === id);
    if (index !== -1) {
        return events.splice(index, 1)[0];
    }
    return null;
};