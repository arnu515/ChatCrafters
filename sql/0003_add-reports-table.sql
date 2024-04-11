CREATE TABLE reports (
	id text primary key,
	report text not null,
	personaId text references personas(id),
	userId text references users(id)
);

