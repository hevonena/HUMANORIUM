import * as THREE from 'three';

export default class HandMarionette {
    constructor(palm, fingers, physicsWorld, scene, AmmoLib) {
        this.palm = palm.object;

        // Extract constraint positions from spheres in the palm
        const palmSpheres = this.palm.children.filter(child => child.name.includes('Sphere'));
        this.palmConstraints = palmSpheres.map(constraint => constraint.position.clone());

        // Extract fingers and their constraint positions
        this.fingers = fingers.map(finger => finger.object);
        const fingerSpheres = fingers.map(finger => finger.object.children.filter(child => child.name.includes('Sphere')));
        this.fingerConstraints = fingerSpheres.map(spheres => spheres.map(constraint => constraint.position.clone()));

        this.physicsWorld = physicsWorld;
        this.scene = scene;
        this.Ammo = AmmoLib;

        this.rigidBodies = [];
        this.softBodies = [];
        this.transformAux1 = new this.Ammo.btTransform();

        // Parameters for the rope
        this.ropeSegments = 10; // Number of segments in the rope
        this.ropeLength = 1.0; // Total length of the rope

        // Initialize the marionette
        this.init();
    }

    init() {
        this.createRigidBodies();
        this.createRopes();
    }

    createRigidBodies() {
        // Create rigid body for the palm
        const palmGeometry = this.palm.children[5].geometry;
        if (!palmGeometry.boundingBox) palmGeometry.computeBoundingBox();
        const palmBoundingBox = palmGeometry.boundingBox;
        const palmSize = new THREE.Vector3();
        palmBoundingBox.getSize(palmSize);

        const palmShape = new this.Ammo.btBoxShape(new this.Ammo.btVector3(palmSize.x * 0.5, palmSize.y * 0.5, palmSize.z * 0.5));
        const palmTransform = new this.Ammo.btTransform();
        palmTransform.setIdentity();
        palmTransform.setOrigin(new this.Ammo.btVector3(this.palm.position.x, this.palm.position.y, this.palm.position.z));

        const palmMass = 0; // Static object
        const palmMotionState = new this.Ammo.btDefaultMotionState(palmTransform);
        const palmLocalInertia = new this.Ammo.btVector3(0, 0, 0);
        const palmRbInfo = new this.Ammo.btRigidBodyConstructionInfo(palmMass, palmMotionState, palmShape, palmLocalInertia);
        const palmRigidBody = new this.Ammo.btRigidBody(palmRbInfo);
        this.physicsWorld.addRigidBody(palmRigidBody);

        // Store the rigid body in the palm object
        this.palm.userData.physicsBody = palmRigidBody;
        this.rigidBodies.push(this.palm);

        // Create rigid bodies for the fingers
        for (let i = 0; i < this.fingers.length; i++) {
            const finger = this.fingers[i];
            const fingerGeometry = finger.children[1].geometry;
            if (!fingerGeometry.boundingBox) fingerGeometry.computeBoundingBox();
            const fingerBoundingBox = fingerGeometry.boundingBox;
            const fingerSize = new THREE.Vector3();
            fingerBoundingBox.getSize(fingerSize);

            const fingerShape = new this.Ammo.btBoxShape(new this.Ammo.btVector3(fingerSize.x * 0.5, fingerSize.y * 0.5, fingerSize.z * 0.5));
            const fingerTransform = new this.Ammo.btTransform();
            fingerTransform.setIdentity();
            fingerTransform.setOrigin(new this.Ammo.btVector3(finger.position.x, finger.position.y, finger.position.z));

            const fingerMass = 1; // Dynamic object
            const fingerLocalInertia = new this.Ammo.btVector3(0, 0, 0);
            fingerShape.calculateLocalInertia(fingerMass, fingerLocalInertia);
            const fingerMotionState = new this.Ammo.btDefaultMotionState(fingerTransform);
            const fingerRbInfo = new this.Ammo.btRigidBodyConstructionInfo(fingerMass, fingerMotionState, fingerShape, fingerLocalInertia);
            const fingerRigidBody = new this.Ammo.btRigidBody(fingerRbInfo);
            this.physicsWorld.addRigidBody(fingerRigidBody);

            // Store the rigid body in the finger object
            finger.userData.physicsBody = fingerRigidBody;
            this.rigidBodies.push(finger);
        }
    }

    createRopes() {
        // Create soft body ropes for each finger
        for (let i = 0; i < this.fingers.length; i++) {
            const palmConstraintPosition = this.palmConstraints[i];
            const fingerConstraintPosition = this.fingerConstraints[i][0]; // Assuming one constraint per finger

            // Calculate rope parameters
            const ropeStart = palmConstraintPosition.clone();
            const ropeEnd = fingerConstraintPosition.clone();
            const ropeVector = new THREE.Vector3().subVectors(ropeEnd, ropeStart);
            const ropeLength = ropeVector.length();

            // Create rope geometry for visualization
            const ropeGeometry = new THREE.BufferGeometry();
            const ropeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
            const ropePositions = [];
            const ropeIndices = [];

            for (let j = 0; j <= this.ropeSegments; j++) {
                const t = j / this.ropeSegments;
                const position = new THREE.Vector3().lerpVectors(ropeStart, ropeEnd, t);
                ropePositions.push(position.x, position.y, position.z);

                if (j < this.ropeSegments) {
                    ropeIndices.push(j, j + 1);
                }
            }

            ropeGeometry.setIndex(ropeIndices);
            ropeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ropePositions, 3));
            const ropeMesh = new THREE.LineSegments(ropeGeometry, ropeMaterial);
            this.scene.add(ropeMesh);

            // Create soft body rope
            const softBodyHelpers = new this.Ammo.btSoftBodyHelpers();
            const ammoRopeStart = new this.Ammo.btVector3(ropeStart.x, ropeStart.y, ropeStart.z);
            const ammoRopeEnd = new this.Ammo.btVector3(ropeEnd.x, ropeEnd.y, ropeEnd.z);
            const ropeSoftBody = softBodyHelpers.CreateRope(
                this.physicsWorld.getWorldInfo(),
                ammoRopeStart,
                ammoRopeEnd,
                this.ropeSegments - 1,
                0 // Fixed endpoints
            );

            // Configure the soft body
            const sbConfig = ropeSoftBody.get_m_cfg();
            sbConfig.set_viterations(10);
            sbConfig.set_piterations(10);
            sbConfig.set_collisions(0x11); // Enable collisions

            ropeSoftBody.setTotalMass(0.1, false);
            this.Ammo.castObject(ropeSoftBody, this.Ammo.btCollisionObject).getCollisionShape().setMargin(0.05);
            ropeSoftBody.setActivationState(4); // Disable deactivation

            this.physicsWorld.addSoftBody(ropeSoftBody, 1, -1);
            ropeMesh.userData.physicsBody = ropeSoftBody;
            this.softBodies.push(ropeMesh);

            // Attach rope to palm and finger
            const palmRigidBody = this.palm.userData.physicsBody;
            const fingerRigidBody = this.fingers[i].userData.physicsBody;

            const influence = 1; // Influence of the attachment

            // Anchor the start of the rope to the palm
            ropeSoftBody.appendAnchor(0, palmRigidBody, false, influence);

            // Anchor the end of the rope to the finger
            ropeSoftBody.appendAnchor(this.ropeSegments, fingerRigidBody, false, influence);
        }
    }

    play() {
        // Lengthen the ropes by increasing the number of segments and adjusting the rope endpoints
        // This requires recreating the ropes with updated parameters
        // For simplicity, we can regenerate the ropes with increased length

        // Remove existing ropes
        for (const ropeMesh of this.softBodies) {
            this.physicsWorld.removeSoftBody(ropeMesh.userData.physicsBody);
            this.scene.remove(ropeMesh);
        }
        this.softBodies = [];

        // Increase the rope length
        this.ropeLength *= 200; // Example: double the length
        this.ropeSegments += 50; // Increase the number of segments for smoother rope

        // Recreate the ropes with updated parameters
        this.createRopes();
    }

    pause() {
        // Shorten the ropes back to their initial length
        // Remove existing ropes
        for (const ropeMesh of this.softBodies) {
            this.physicsWorld.removeSoftBody(ropeMesh.userData.physicsBody);
            this.scene.remove(ropeMesh);
        }
        this.softBodies = [];

        // Reset rope parameters
        this.ropeLength /= 200; // Restore the original length
        this.ropeSegments -= 50; // Restore the original number of segments

        // Recreate the ropes with initial parameters
        this.createRopes();
    }

    animate() {
        // Update the Three.js meshes to match the physics bodies

        // Update rigid bodies
        for (const objThree of this.rigidBodies) {
            const objPhys = objThree.userData.physicsBody;
            const ms = objPhys.getMotionState();
            if (ms) {
                ms.getWorldTransform(this.transformAux1);
                const p = this.transformAux1.getOrigin();
                const q = this.transformAux1.getRotation();
                objThree.position.set(p.x(), p.y(), p.z());
                objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
            }
        }

        // Update soft bodies (ropes)
        for (const ropeMesh of this.softBodies) {
            const ropeSoftBody = ropeMesh.userData.physicsBody;
            const positions = ropeMesh.geometry.attributes.position.array;
            const numVerts = positions.length / 3;
            const nodes = ropeSoftBody.get_m_nodes();

            for (let i = 0; i < numVerts; i++) {
                const node = nodes.at(i);
                const nodePos = node.get_m_x();
                positions[i * 3] = nodePos.x();
                positions[i * 3 + 1] = nodePos.y();
                positions[i * 3 + 2] = nodePos.z();
            }

            ropeMesh.geometry.attributes.position.needsUpdate = true;
        }
    }
}