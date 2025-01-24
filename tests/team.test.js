const request = require("supertest");
const app = require("../server/server"); // Adjust path to your LoopBack server

describe("Team API", () => {
  let createdTeam;
  let createdMember;
  const arrayCreatedTeam = [];
  const rootTeamsUrl = "/api/Teams";

  afterAll(async () => {
    // Clean up the team created during the test
    const ds = app.datasources.postgresql; // Your datasource

    // Create a string of placeholders for the SQL query
    const placeholders = arrayCreatedTeam.map((_, index) => `$${index + 1}`).join(", ");

    // Construct the SQL query
    const query = `DELETE FROM Team WHERE id IN (${placeholders})`;

    await new Promise((resolve, reject) => {
      ds.connector.execute(
        query,
        arrayCreatedTeam,
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    ds.disconnect();
  });

  beforeAll(async () => {
    // Create a team before running tests
    const newTeam = {
      name: "test-team-new",
      description: "team created for test purpose",
    };

    const resTeam = await request(app)
      .post(rootTeamsUrl)
      .send(newTeam)
      .expect("Content-Type", /json/)
      .expect(200);

    createdTeam = resTeam.body;
  });

  // PATCH /Teams
  it("should patch an existing team", async () => {
    const newName = "Updated Team";
    const updatedTeam = { id: createdTeam.id, name: newName };

    const res = await request(app)
      .patch(`${rootTeamsUrl}`)
      .send(updatedTeam)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", createdTeam.id);
    expect(res.body).toHaveProperty("name", newName);
    expect(res.body).toHaveProperty("description", createdTeam.description);

    arrayCreatedTeam.push(createdTeam.id);
    createdTeam = res.body;
  });

  // GET /Teams
  it("should fetch all teams", async () => {
    const res = await request(app)
      .get(rootTeamsUrl)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
  });

  // PUT /Teams
  it("should replace an existing team", async () => {
    const newName = "Team Beta";
    const newDesc = "Team Beta Description";
    const newTeam = { id: createdTeam.id, name: newName, description: newDesc };

    const res = await request(app)
      .put(`${rootTeamsUrl}`)
      .send(newTeam)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", createdTeam.id);
    expect(res.body).toHaveProperty("name", newName);
    expect(res.body).toHaveProperty("description", newDesc);

    arrayCreatedTeam.push(createdTeam.id);
    createdTeam = res.body;
  });

  // DELETE /Teams/{id}
  it("should delete a team by ID", async () => {
    const res = await request(app)
      .delete(`${rootTeamsUrl}/${createdTeam.id}`)
      .expect(200);

    expect(res.body).toHaveProperty("count", 1);
  });

  // POST /Teams
  it("should create a new team", async () => {
    const newName = "Team Alpha";
    const newDesc = "This is Team Alpha";
    const newTeam = { name: newName, description: newDesc };

    const res = await request(app)
      .post(rootTeamsUrl)
      .send(newTeam)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe(newTeam.name);
    expect(res.body.description).toBe(newTeam.description);

    arrayCreatedTeam.push(createdTeam.id);
    createdTeam = res.body;
  });

  // PATCH /Teams/{id}
  it("should patch a team by ID", async () => {
    const newName = "Updated Team";
    const updatedTeam = { name: newName };

    const res = await request(app)
      .put(`${rootTeamsUrl}/${createdTeam.id}`)
      .send(updatedTeam)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", createdTeam.id);
    expect(res.body.name).toBe(updatedTeam.name);
  });

  // PUT /Teams/{id}
  it("should update a team by ID", async () => {
    const newName = "put-team-name";
    const newDesc = "put-team-description";
    const newTeam = { name: newName, description: newDesc };

    const res = await request(app)
      .put(`${rootTeamsUrl}/${createdTeam.id}`)
      .send(newTeam)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", createdTeam.id);
    expect(res.body.name).toBe(newTeam.name);
    expect(res.body.description).toBe(newTeam.description);
  });

  // GET /Teams/{id}
  it("should fetch a single team by ID", async () => {
    const res = await request(app)
      .get(`${rootTeamsUrl}/${createdTeam.id}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", createdTeam.id);
  });

  // HEAD /Teams/{id}
  it("should check if a team exists", async () => {
    await request(app).head(`${rootTeamsUrl}/${createdTeam.id}`).expect(200);
  });

  // GET /Teams/{id}/exists
  it("should check if a team exists by ID", async () => {
    const res = await request(app)
      .get(`${rootTeamsUrl}/${createdTeam.id}/exists`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("exists", true);
  });

  // GET /Teams/{id}/members
  it("should fetch members of the team", async () => {
    const res = await request(app)
      .get(`${rootTeamsUrl}/${createdTeam.id}/members`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(0);
  });

  // POST /Teams/{id}/members
  it("should add a member to the team", async () => {
    const newName = "post-team-id-member";
    const newRole = "member";
    const newMember = {
      name: newName,
      role: newRole,
    };

    const res = await request(app)
      .post(`${rootTeamsUrl}/${createdTeam.id}/members`)
      .send(newMember)
      .expect("Content-Type", /json/)
      .expect(200);
    await request(app)
      .post(`${rootTeamsUrl}/${createdTeam.id}/members`)
      .send(newMember)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("teamId", createdTeam.id);
    expect(res.body).toHaveProperty("name", newName);
    expect(res.body).toHaveProperty("role", newRole);

    arrayCreatedTeam.push(createdTeam.id);
    createdMember = res.body;
  });

  // GET /Teams/{id}/members/{fk}
  it("should fetch a specific member of the team", async () => {
    const res = await request(app)
      .get(`${rootTeamsUrl}/${createdTeam.id}/members/${createdMember.id}`) // Replace with valid IDs
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id");
  });

  // PUT /Teams/{id}/members/{fk}
  it("should update a member of the team", async () => {
    const newRole = "put-new-role";
    const updatedMember = { role: newRole }; // Example update

    const res = await request(app)
      .put(`${rootTeamsUrl}/${createdTeam.id}/members/${createdMember.id}`) // Replace with valid IDs
      .send(updatedMember)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("role", newRole);
  });

  // DELETE /Teams/{id}/members/{fk}
  it("should delete a member from the team", async () => {
    await request(app)
      .delete(`${rootTeamsUrl}/${createdTeam.id}/members/${createdMember.id}`) // Replace with valid IDs
      .expect(204);
  });

  // GET /Teams/{id}/members/count
  it("should count members of the team", async () => {
    const res = await request(app)
      .get(`${rootTeamsUrl}/${createdTeam.id}/members/count`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("count", 1);
  });

  // DELETE /Teams/{id}/members
  it("should delete all members of the team", async () => {
    await request(app)
      .delete(`${rootTeamsUrl}/${createdTeam.id}/members`)
      .expect(204);

    const res = await request(app)
      .get(`${rootTeamsUrl}/${createdTeam.id}/members/count`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("count", 0);
  });

  // POST /Teams/{id}/replace
  it("should replace a team", async () => {
    const newTeamData = { name: "Team Gamma" };

    const res = await request(app)
      .post(`${rootTeamsUrl}/${createdTeam.id}/replace`)
      .send(newTeamData)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", createdTeam.id);
  });

  // GET /Teams/count
  it("should count teams", async () => {
    const res = await request(app)
      .get(`${rootTeamsUrl}/count`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("count");
  });

  // GET /Teams/findOne
  it("should find one team", async () => {
    const filter = { where: { id: createdTeam.id } };
    const encodedFilter = encodeURIComponent(JSON.stringify(filter)); // Correctly encode the filter

    const res = await request(app)
      .get(`${rootTeamsUrl}/findOne?filter=${encodedFilter}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", createdTeam.id);
  });

  // POST /Teams/replaceOrCreate
  it("should replace or create a team", async () => {
    const newTeam = { name: "Team Delta", description: "team delta desc" };

    const res = await request(app)
      .post(`${rootTeamsUrl}/replaceOrCreate`)
      .send(newTeam)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id");

    arrayCreatedTeam.push(createdTeam.id);
    createdTeam = res.body;
  });

  // POST /Teams/update
  it("should update teams", async () => {
    const updateData = {
      name: "Updated Team",
      description: "updated delta desc",
    };

    const res = await request(app)
      .post(
        `${rootTeamsUrl}/update?where=${encodeURIComponent(
          JSON.stringify({ id: createdTeam.id })
        )}`
      )
      .send(updateData)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("count", 1);
  });

  // POST /Teams/upsertWithWhere
  it("should upsert with where", async () => {
    const whereClause = { id: createdTeam.id };
    const newDesc = "upsert-team-desc";
    const upsertData = { description: newDesc };

    const res = await request(app)
      .post(
        `${rootTeamsUrl}/upsertWithWhere?where=${encodeURIComponent(
          JSON.stringify(whereClause)
        )}`
      )
      .send(upsertData)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", createdTeam.id);
    expect(res.body).toHaveProperty("description", newDesc);

    arrayCreatedTeam.push(res.body.id);
  });
});
