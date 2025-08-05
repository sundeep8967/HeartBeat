import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { razorpayUtils } from "@/lib/razorpay";
import { app } from "@/lib/firebase";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testResults = {
      firebase: {
        connection: false,
        auth: false,
        firestore: false,
        storage: false,
        error: null
      },
      razorpay: {
        connection: false,
        orderCreation: false,
        error: null
      },
      database: {
        connection: false,
        userAccess: false,
        error: null
      }
    };

    // Test Firebase Connection
    try {
      // Test Firebase app initialization
      if (app) {
        testResults.firebase.connection = true;
      }

      // Test Firestore
      const testDoc = await db.collection('test').doc('integration').get();
      testResults.firebase.firestore = true;

      // Test Storage (if configured)
      try {
        const { getStorage } = await import('firebase-admin/storage');
        const storage = getStorage(app);
        if (storage) {
          testResults.firebase.storage = true;
        }
      } catch (storageError) {
        console.log('Storage not configured:', storageError);
      }

      // Test Auth
      try {
        const { getAuth } = await import('firebase-admin/auth');
        const auth = getAuth(app);
        if (auth) {
          testResults.firebase.auth = true;
        }
      } catch (authError) {
        console.log('Auth not configured:', authError);
      }

    } catch (firebaseError) {
      testResults.firebase.error = firebaseError instanceof Error ? firebaseError.message : 'Unknown error';
    }

    // Test Razorpay Connection
    try {
      // Test Razorpay instance
      if (razorpayUtils) {
        testResults.razorpay.connection = true;
      }

      // Test order creation (with minimal amount)
      const testOrder = await razorpayUtils.createOrder(1, 'INR');
      testResults.razorpay.orderCreation = true;

    } catch (razorpayError) {
      testResults.razorpay.error = razorpayError instanceof Error ? razorpayError.message : 'Unknown error';
    }

    // Test Database Connection
    try {
      // Test Prisma connection
      const currentUser = await db.user.findUnique({
        where: { email: session.user.email }
      });

      if (currentUser) {
        testResults.database.connection = true;
        testResults.database.userAccess = true;
      } else {
        testResults.database.connection = true;
        testResults.database.userAccess = false;
      }

    } catch (dbError) {
      testResults.database.error = dbError instanceof Error ? dbError.message : 'Unknown error';
    }

    // Calculate overall status
    const allTests = [
      testResults.firebase.connection,
      testResults.firebase.firestore,
      testResults.razorpay.connection,
      testResults.razorpay.orderCreation,
      testResults.database.connection
    ];

    const overallStatus = allTests.every(test => test === true) ? 'healthy' : 'issues_detected';

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      tests: testResults,
      summary: {
        firebase: Object.values(testResults.firebase).filter(v => v === true).length - 1, // Subtract error field
        razorpay: Object.values(testResults.razorpay).filter(v => v === true).length - 1,
        database: Object.values(testResults.database).filter(v => v === true).length - 1,
        total: allTests.filter(v => v === true).length,
        totalTests: allTests.length
      }
    });

  } catch (error) {
    console.error("Integration test error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}