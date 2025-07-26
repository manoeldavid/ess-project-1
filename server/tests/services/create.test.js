import { defineFeature, loadFeature } from 'jest-cucumber';
import MusicService from '../../services/music.service.js';
import Music from '../../models/music.model.js';

const feature = loadFeature('./tests/services/createMusic.feature');

jest.mock('../../models/music.model.js');

defineFeature(feature, (test) => {
  let result;
  let error;
  let musicData;

  beforeEach(() => {
    result = null;
    error = null;
    musicData = null;
    jest.clearAllMocks();

    // Mock padrão para findOne().sort().lean() usado para gerar musicId
    Music.findOne.mockImplementation((query) => {
      // Verificação se é busca por título e artista (música existente)
      if (query && query.title && query.artist) {
        return Promise.resolve(null); // por padrão, a música não existe
      }

      // Se não for essa verificação, retorna o encadeamento sort().lean()
      return {
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null) // pode retornar { musicId: '042' } se desejar
        })
      };
    });
  });

  const buildMusicObject = (table) => {
    const row = table[0];
    return {
      title: row.title,
      artist: row.artist,
      album: row.album,
      releaseYear: row.releaseYear,
      duration: row.duration,
      url: row.url,
      platforms: row.platforms ? row.platforms.split(',').map(p => p.trim()) : [],
      cover: row.cover,
    };
  };

  test('Cadastrar nova música com dados válidos', ({ given, when, then, and }) => {
    given(/^a música "(.*)" do artista "(.*)" não existe na plataforma$/, (title, artist) => {
      Music.findOne.mockImplementation((query) => {
        if (query?.title === title && query?.artist === artist) {
          return Promise.resolve(null);
        }
        return {
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(null)
          })
        };
      });
    });

    when(/^uma requisição "POST" é enviada para "\/musics"$/, () => {
      // Passo descritivo
    });

    and('o corpo desta requisição contém os seguintes campos:', async (table) => {
      musicData = buildMusicObject(table);
      Music.create.mockResolvedValue({ musicId: '123abc', ...musicData });

      try {
        result = await MusicService.createMusic(musicData);
      } catch (err) {
        error = err;
      }
    });

    then('estes dados devem ser salvos no banco de dados', () => {
      expect(Music.create).toHaveBeenCalledWith(expect.objectContaining(musicData));
    });

    and('o status da resposta deve ser "201"', () => {
      expect(result).toBeDefined();
    });

    and('a mensagem "Música criada com sucesso!" deve estar presente na resposta', () => {
      // A mensagem está no controller, o service retorna apenas o objeto music.
      // Aqui validamos que a música foi criada.
      expect(result.title).toBe(musicData.title);
    });
  });

  test('Tentativa de criação com campo obrigatório faltando', ({ given, when, and, then }) => {
    given(/^a música "(.*)" do artista "(.*)" não existe na plataforma$/, () => {
      Music.findOne.mockResolvedValue(null);
    });

    when(/^uma requisição "POST" é enviada para "\/musics"$/, () => {});

    and('o corpo desta requisição contém os seguintes campos:', async (table) => {
      musicData = buildMusicObject(table);
      try {
        await MusicService.createMusic(musicData);
      } catch (err) {
        error = err;
      }
    });

    then('o sistema rejeita o cadastro', () => {
      expect(error).toBeDefined();
    });

    and('o status da resposta deve ser "400"', () => {
      expect(error.message).toBe('Por favor, preencha todos os campos.');
    });

    and('a mensagem "Por favor, preencha todos os campos." deve estar presente na resposta', () => {
      expect(error.message).toBe('Por favor, preencha todos os campos.');
    });
  });

  test('Tentar cadastrar música sem capa', ({ given, when, and, then }) => {
    given(/^a música "(.*)" do artista "(.*)" não existe na plataforma$/, () => {
      Music.findOne.mockResolvedValue(null);
    });

    when(/^uma requisição "POST" é enviada para "\/musics"$/, () => {});

    and('o corpo desta requisição contém os seguintes campos:', async (table) => {
      musicData = buildMusicObject(table);
      try {
        await MusicService.createMusic(musicData);
      } catch (err) {
        error = err;
      }
    });

    then('o sistema rejeita o cadastro', () => {
      expect(error).toBeDefined();
    });

    and('o status da resposta deve ser "400"', () => {
      expect(error.message).toBe('A capa da música é obrigatória.');
    });

    and('a mensagem "A capa da música é obrigatória." deve estar presente na resposta', () => {
      expect(error.message).toBe('A capa da música é obrigatória.');
    });
  });

  test('Tentar cadastrar música com duração mal formatada', ({ given, when, and, then }) => {
  given(/^a música "(.*)" do artista "(.*)" não existe na plataforma$/, (title, artist) => {
  Music.findOne.mockImplementation((query) => {
    if (query?.title === title && query?.artist === artist) {
      return Promise.resolve(null); // Música não existe
    }

    return {
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null), // Para gerar novo musicId
      }),
    };
  });
});

  when(/^uma requisição "POST" é enviada para "\/musics"$/, () => {});

  and('o corpo desta requisição contém os seguintes campos:', async (table) => {
    musicData = buildMusicObject(table);
    try {
      await MusicService.createMusic(musicData);
    } catch (err) {
      error = err;
    }
  });

  then('o sistema rejeita o cadastro', () => {
    expect(error).toBeDefined();
  });

  and('o status da resposta deve ser "400"', () => {
    expect(error.message).toBe('A duração deve estar no formato mm:ss');
  });

  and('a mensagem "A duração deve estar no formato mm:ss" deve estar presente na resposta', () => {
    expect(error.message).toBe('A duração deve estar no formato mm:ss');
  });
});

  test('Tentar cadastrar música com ano inválido', ({ given, when, and, then }) => {
    given(/^a música "(.*)" do artista "(.*)" não existe na plataforma$/, () => {
      Music.findOne.mockResolvedValue(null);
    });

    when(/^uma requisição "POST" é enviada para "\/musics"$/, () => {});

    and('o corpo desta requisição contém os seguintes campos:', async (table) => {
      musicData = buildMusicObject(table);
      try {
        await MusicService.createMusic(musicData);
      } catch (err) {
        error = err;
      }
    });

    then('o sistema rejeita o cadastro', () => {
      expect(error).toBeDefined();
    });

    and('a resposta retorna status "400"', () => {
      expect(error.message).toBe('O ano de lançamento deve conter 4 dígitos numéricos.');
    });

    and('a mensagem "O ano de lançamento deve conter 4 dígitos numéricos." deve estar presente na resposta', () => {
      expect(error.message).toBe('O ano de lançamento deve conter 4 dígitos numéricos.');
    });
  });

  test('Cadastrar música já existente', ({ given, when, and, then }) => {
    given(/^já existe no sistema a música "(.*)" do artista "(.*)"$/, (title, artist) => {
      Music.findOne.mockImplementation((query) => {
        if (query?.title === title && query?.artist === artist) {
          return Promise.resolve({ title, artist });
        }
        return {
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(null)
          })
        };
      });
    });

    when(/^uma requisição "POST" é enviada para "\/musics" com os seguintes dados:$/, async (table) => {
      musicData = buildMusicObject(table);
      try {
        await MusicService.createMusic(musicData);
      } catch (err) {
        error = err;
      }
    });

    then('o sistema rejeita o cadastro', () => {
      expect(error).toBeDefined();
    });

    and('a resposta retorna status "400"', () => {
      expect(error.message).toBe('Essa música já está cadastrada no sistema.');
    });

    and('a mensagem "Essa música já está cadastrada no sistema." deve estar presente na resposta', () => {
      expect(error.message).toBe('Essa música já está cadastrada no sistema.');
    });
  });
});
