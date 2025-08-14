export const PERFORMANCE_GENRES = [
  { id: 'circus', name: '서커스/마술'},
  { id: 'concert', name: '대중음악'},
  { id: 'play', name: '연극'},
  { id: 'classical', name: '서양음악(클래식)' },
  { id: 'dance', name: '무용(서양/한국무용)'},
  { id: 'musical', name: '뮤지컬'},
  { id: 'complex', name: '복합' },
  { id: 'traditional', name: '한국음악(국악)'},
  { id: 'popular-dance', name: '대중무용'}
] as const;

export type GenreId = typeof PERFORMANCE_GENRES[number]['id'];

export const getGenreById = (id: GenreId) => {
  return PERFORMANCE_GENRES.find(genre => genre.id === id);
};

export const getGenreName = (id: GenreId) => {
  return getGenreById(id)?.name || id;
}; 