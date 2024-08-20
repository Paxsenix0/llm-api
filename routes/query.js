/* @swagger
 * /api/query:
 * get:
 * summary: Query a string.
 * description: Query a string for the llm to respond to.
 * parameters:
 * - in: query
 * name: string
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: A successful response
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * result:
 * type: string
 */

/*
app.get('/api/query', (req, res) => {
    // Your route logic goes here
});
*/
export default function (app, scraper) {
    app.get('/api/query', async (req, res) => {
        try {
            let llmResponse = await scraper.query(req.query.string);
            res.json(llmResponse);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
}
