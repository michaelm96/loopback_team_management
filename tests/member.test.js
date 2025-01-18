const request = require("supertest");
const app = require("../server/server"); // Adjust path to your LoopBack server

describe("Member API", () => {
  let createdMemberId;
  const rootMembersUrl = "/api/Members";
  const rootTeamsUrl = "/api/Teams";
  let teamId; // Assuming a valid team ID for testing

  afterAll(async () => {
    // Clean up the member created during the test
    const ds = app.datasources.postgresql; // Your datasource

    await new Promise((resolve, reject) => {
      ds.connector.execute(
        `DELETE FROM Member WHERE id = $1`,
        [createdMemberId],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    ds.disconnect();
  });

  beforeAll(async () => {
    // Create a member before running tests
    const newMember = { name: "John Doe", role: "member", teamId };
    const newTeam = {
      name: "test-team",
      description: "team created for test purpose",
    };

    const res = await request(app)
      .post(rootMembersUrl)
      .send(newMember)
      .expect("Content-Type", /json/)
      .expect(200);

    const resTeam = await request(app)
      .post(rootTeamsUrl)
      .send(newTeam)
      .expect("Content-Type", /json/)
      .expect(200);

    createdMemberId = res.body.id;
    teamId = resTeam.body.id;
  });

  // GET /Members
  it("should fetch all members", async () => {  
    const res = await request(app)  
      .get(rootMembersUrl)  
      .expect("Content-Type", /json/)  
      .expect(200);  
  
    expect(res.body).toBeInstanceOf(Array);  
  });  
  
  // POST /Members
  it("should create a new member", async () => {  
    const newName = "John Doe";
    const newRole = "member";
    const newMember = { name: newName, role: newRole, teamId };  
  
    const res = await request(app)  
      .post(rootMembersUrl)
      .send(newMember)  
      .expect("Content-Type", /json/)  
      .expect(200);  
  
    expect(res.body).toHaveProperty("id");  
    expect(res.body.name).toBe(newMember.name);  
    expect(res.body.role).toBe(newMember.role);  
  
    createdMemberId = res.body.id; // Store the created member ID for later tests  
  });  
  
  // PUT /Members
  it("should update an existing member", async () => {  
    const newName = "John Doe Updated";
    const newRole = "member updated";
    const updatedMember = { name: newName, role: newRole, teamId };  

    const res = await request(app)  
      .put(`${rootMembersUrl}/${createdMemberId}`)  
      .send(updatedMember)  
      .expect("Content-Type", /json/)  
      .expect(200);  
  
    expect(res.body).toHaveProperty("id", createdMemberId);  
    expect(res.body.name).toBe(updatedMember.name);  
    expect(res.body.role).toBe(updatedMember.role);  

  });  
  
  // PATCH /Members
  it("should patch an existing member", async () => {  
    const newName = "John Doe Patched";
    const newRole = "member patched";
    const updatedMember = { id: createdMemberId, name: newName, role: newRole }; 
  
    const res = await request(app)  
      .patch(`${rootMembersUrl}/${createdMemberId}`)  
      .send(updatedMember)  
      .expect("Content-Type", /json/)  
      .expect(200);  
  
    expect(res.body).toHaveProperty("id", createdMemberId);  
    expect(res.body.name).toBe(updatedMember.name);  
    expect(res.body.role).toBe(updatedMember.role);
    expect(res.body.teamId).toBe(teamId);
  }); 

  // PATCH /Members/{id}
  it("should update a member's role using PATCH", async () => {
    const newRole = "patch-member";
    const res = await request(app)
      .patch(`${rootMembersUrl}/${createdMemberId}`)
      .send({ role: newRole })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", createdMemberId);
    expect(res.body).toHaveProperty("role", newRole);
  });

  // GET /Members/{id}
  it("should fetch a single member by ID", async () => {
    const res = await request(app)
      .get(`${rootMembersUrl}/${createdMemberId}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", createdMemberId);
  });

  // HEAD /Members/{id}
  it("should return a 200 status for HEAD request on a valid member ID", async () => {
    await request(app).head(`${rootMembersUrl}/${createdMemberId}`).expect(200);
  });

  // PUT /Members/{id}
  it("should replace a member using PUT", async () => {
    const newRole = "put-member";
    const newName = "put john doe";
    const res = await request(app)
      .put(`${rootMembersUrl}/${createdMemberId}`)
      .send({ role: newRole, name: newName, teamId })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", createdMemberId);
    expect(res.body).toHaveProperty("role", newRole);
    expect(res.body).toHaveProperty("name", newName);
  });

  // DELETE /Members/{id}
  it("should delete a member by ID", async () => {
    await request(app)
      .delete(`${rootMembersUrl}/${createdMemberId}`)
      .expect(200);

    // Re-create the member for subsequent tests
    const newMember = { name: "John Doe", role: "member", teamId };
    const res = await request(app)
      .post(rootMembersUrl)
      .send(newMember)
      .expect("Content-Type", /json/)
      .expect(200);

    createdMemberId = res.body.id;
  });

  // GET /Members/{id}/exists
  it("should check if a member exists by ID", async () => {
    const res = await request(app)
      .get(`${rootMembersUrl}/${createdMemberId}/exists`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("exists", true);
  });

  // POST /Members/{id}/replace
  it("should replace a member using POST /replace", async () => {
    const newRole = "post-replace-member";
    const newName = "post-replace john doe";
    const res = await request(app)
      .post(`${rootMembersUrl}/${createdMemberId}/replace`)
      .send({ role: newRole, name: newName, teamId })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", createdMemberId);
    expect(res.body).toHaveProperty("role", newRole);
    expect(res.body).toHaveProperty("name", newName);
  });

  // GET /Members/{id}/team
  it("should fetch the team of a member", async () => {
    const res = await request(app)
      .get(`${rootMembersUrl}/${createdMemberId}/team`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", teamId);
  });

  // GET /Members/{id}/team/members
  it("should fetch all members of a team", async () => {
    const res = await request(app)
      .get(`${rootMembersUrl}/${createdMemberId}/team/members`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
  });

  // POST /Members/{id}/team/members
  it("should add a member to a team", async () => {
    const newMember = { name: "Jane Doe", role: "member", teamId };
    const res = await request(app)
      .post(`${rootMembersUrl}/${createdMemberId}/team/members`)
      .send(newMember)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe(newMember.name);
  });

  // GET /Members/{id}/team/members/{fk}
  it("should fetch a specific member from a team", async () => {
    const newMember = { name: "Jane Doe", role: "member", teamId };
    const resCreate = await request(app)
      .post(`${rootMembersUrl}/${createdMemberId}/team/members`)
      .send(newMember)
      .expect("Content-Type", /json/)
      .expect(200);

    const fk = resCreate.body.id;
    const res = await request(app)
      .get(`${rootMembersUrl}/${createdMemberId}/team/members/${fk}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", fk);
    expect(res.body.name).toBe(newMember.name);
  });

  // PUT /Members/{id}/team/members/{fk}
  it("should update a specific member in a team", async () => {
    const newMember = { name: "Jane Doe", role: "member", teamId };
    const resCreate = await request(app)
      .post(`${rootMembersUrl}/${createdMemberId}/team/members`)
      .send(newMember)
      .expect("Content-Type", /json/)
      .expect(200);

    const fk = resCreate.body.id;
    const newName = "Jane Smith";
    const res = await request(app)
      .put(`${rootMembersUrl}/${createdMemberId}/team/members/${fk}`)
      .send({ name: newName })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", fk);
    expect(res.body.name).toBe(newName);
  });

  // DELETE /Members/{id}/team/members/{fk}
  it("should delete a specific member from a team", async () => {
    const newMember = { name: "Jane Doe", role: "member", teamId };
    const resCreate = await request(app)
      .post(`${rootMembersUrl}/${createdMemberId}/team/members`)
      .send(newMember)
      .expect("Content-Type", /json/)
      .expect(200);

    const fk = resCreate.body.id;
    await request(app)
      .delete(`${rootMembersUrl}/${createdMemberId}/team/members/${fk}`)
      .expect(204);
  });

  // GET /Members/count
  it("should count the number of members", async () => {
    const res = await request(app)
      .get(`${rootMembersUrl}/count`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("count");
  });

  // GET /Members/findOne
  it("should find one member", async () => {
    const filter = { where: { id: createdMemberId } };  
    const encodedFilter = encodeURIComponent(JSON.stringify(filter)); // Correctly encode the filter  
  
    const res = await request(app)  
      .get(`${rootMembersUrl}/findOne?filter=${encodedFilter}`)  
      .expect("Content-Type", /json/)  
      .expect(200);  
  
    expect(res.body).toHaveProperty("id", createdMemberId);  
  });

  // POST /Members/replaceOrCreate
  it("should replace or create a member", async () => {
    const newMember = { name: "John Doe", role: "member", teamId };
    const res = await request(app)
      .post(`${rootMembersUrl}/replaceOrCreate`)
      .send(newMember)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe(newMember.name);
  });

  // POST /Members/update
  it("should update members", async () => {
    const updateData = { role: "updated-member" };
    const res = await request(app)
      .post(
        `${rootMembersUrl}/update?where=${encodeURIComponent(
          JSON.stringify({ teamId })
        )}`
      )
      .send(updateData)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.count).toBeGreaterThan(0);
  });

  // POST /Members/upsertWithWhere
  it("should upsert a member with a where clause", async () => {
    const whereClause = { id: createdMemberId };
    const updateData = { role: "upsert-member" };
    const res = await request(app)
      .post(
        `${rootMembersUrl}/upsertWithWhere?where=${encodeURIComponent(
          JSON.stringify(whereClause)
        )}`
      )
      .send(updateData)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("id", createdMemberId);
    expect(res.body.role).toBe(updateData.role);
  });

  // GET /Members/{id}/team/members/count
  it("should count the number of members in a team", async () => {
    const res = await request(app)
      .get(`${rootMembersUrl}/${createdMemberId}/team/members/count`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("count", 5);
  });

  // DELETE /Members/{id}/team/members
  it("should delete all members from a team", async () => {
    await request(app)
      .delete(`${rootMembersUrl}/${createdMemberId}/team/members`)
      .expect(204);
  });
});
