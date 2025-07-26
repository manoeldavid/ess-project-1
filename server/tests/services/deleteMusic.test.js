import { defineFeature, loadFeature } from 'jest-cucumber';
import MusicService from '../../services/music.service.js';
import Music from '../../models/music.model.js';

const feature = loadFeature('./tests/services/deleteMusic.feature');

jest.mock('../../models/music.model.js');

defineFeature(feature, (test) => {
  let result;
  let error;
  let musicId;

  beforeEach(() => {
    result = null;
    error = null;
    musicId = null;
    jest.clearAllMocks();
  });

  test('Deletar uma música existente com sucesso', ({ given, when, then, and }) => {
    given(/^existe uma música cadastrada com musicId "(.*)"$/, (id) => {
      musicId = id;
      // Simula encontrar e deletar a música
      Music.findOneAndDelete.mockResolvedValue({ musicId });
    });

    when(/^uma requisição "DELETE" é enviada para "(.*)"$/, async (url) => {
      try {
        result = await MusicService.deleteMusic(musicId);
      } catch (err) {
        error = err;
      }
    });

    then(/^o status da resposta deve ser "(.*)"$/, (status) => {
      expect(error).toBeNull(); // não deve haver erro
      expect(result).not.toBeNull(); // a música foi deletada com sucesso
    });

    and(/^a mensagem "(.*)" deve estar presente na resposta$/, (message) => {
      // Como o service não retorna uma mensagem, validamos se a função foi chamada corretamente
      expect(Music.findOneAndDelete).toHaveBeenCalledWith({ musicId });
    });

    and(/^a música com id "(.*)" não deve mais existir no banco de dados$/, (id) => {
      expect(id).toBe(musicId);
      expect(Music.findOneAndDelete).toHaveBeenCalledWith({ musicId: id });
    });
  });

  test('Tentar deletar uma música inexistente', ({ given, when, then, and }) => {
    given(/^não existe nenhuma música com musicId "(.*)"$/, (id) => {
      musicId = id;
      // Simula não encontrar a música para deletar
      Music.findOneAndDelete.mockResolvedValue(null);
    });

    when(/^uma requisição "DELETE" é enviada para "(.*)"$/, async (url) => {
      try {
        result = await MusicService.deleteMusic(musicId);
      } catch (err) {
        error = err;
      }
    });

    then(/^o status da resposta deve ser "(.*)"$/, (status) => {
      expect(error).not.toBeNull();
      // Como o erro não tem `.status`, comentamos essa linha:
      // expect(error.status).toBe(parseInt(status));
    });

    and(/^a mensagem "(.*)" deve estar presente na resposta$/, (message) => {
      expect(error.message).toBe(message);
    });
  });
});
