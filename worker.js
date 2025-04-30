import data from './watch.json';

export default {
  async fetch(request) {
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
