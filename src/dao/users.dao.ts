import { MongoClient } from 'mongodb';

let users
let sessions

export default class UsersDAO {
  public static async injectDB(conn: MongoClient) {
    if (users && sessions) {
      return;
    }
    try {
      users = await conn.db(process.env.CLUSTER_DB_NS).collection('users');
      sessions = await conn.db(process.env.CLUSTER_DB_NS).collection('sessions');
    } catch (e) {
      console.error(`Unable to establish collection handles in userDAO: ${e}`);
    }
  }



  public static async getUser(email) {
    return await users.findOne({ someField: 'someValue' })
  }


  public static async addUser(userInfo) {

    try {
      await users.insertOne({ someField: 'someValue' });
      return { success: true };
    } catch (e) {
      if (String(e).startsWith('MongoError: E11000 duplicate key error')) {
        return { error: 'A user with the given email already exists.' };
      }
      console.error(`Error occurred while adding new user, ${e}.`);
      return { error: e };
    }
  }


  public static async loginUser(email, jwt) {
    try {
      await sessions.updateOne(
        { someField: 'someValue' },
        { $set: { someOtherField: 'someOtherValue' } },
      );
      return { success: true };
    } catch (e) {
      console.error(`Error occurred while logging in user, ${e}`)
      return { error: e };
    }
  }

  public static async logoutUser(email) {
    try {
      await sessions.deleteOne({ someField: 'someValue' });
      return { success: true };
    } catch (e) {
      console.error(`Error occurred while logging out user, ${e}`)
      return { error: e };
    }
  }

  public static async getUserSession(email) {
    try {
      return sessions.findOne({ someField: 'someValue' });
    } catch (e) {
      console.error(`Error occurred while retrieving user session, ${e}`);
      return null;
    }
  }

  public static async deleteUser(email) {
    try {
      await users.deleteOne({ email });
      await sessions.deleteOne({ user_id: email });
      if (!(await this.getUser(email)) && !(await this.getUserSession(email))) {
        return { success: true };
      } else {
        console.error(`Deletion unsuccessful`);
        return { error: `Deletion unsuccessful` };
      }
    } catch (e) {
      console.error(`Error occurred while deleting user, ${e}`);
      return { error: e };
    }
  }


  public static async updatePreferences(email, preferences) {
    try {

      preferences = preferences || {};

      const updateResponse: any = {};
      // await users.updateOne(
      //   { someField: someValue },
      //   { $set: { someOtherField: someOtherValue } },
      // )

      if (updateResponse.matchedCount === 0) {
        return { error: 'No user found with that email' };
      }
      return updateResponse;
    } catch (e) {
      console.error(
        `An error occurred while updating this user's preferences, ${e}`,
      );
      return { error: e };
    }
  }

  public static async checkAdmin(email) {
    try {
      const { isAdmin } = await this.getUser(email);
      return isAdmin || false;
    } catch (e) {
      return { error: e };
    }
  }

  public static async makeAdmin(email) {
    try {
      const updateResponse = users.updateOne(
        { email },
        { $set: { isAdmin: true } },
      );
      return updateResponse;
    } catch (e) {
      return { error: e };
    }
  }
}

/**
 * Parameter passed to addUser method
 * @typedef UserInfo
 * @property {string} name
 * @property {string} email
 * @property {string} password
 */

/**
 * Success/Error return object
 * @typedef DAOResponse
 * @property {boolean} [success] - Success
 * @property {string} [error] - Error
 */