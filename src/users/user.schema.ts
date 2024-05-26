import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

// Definiciones de un perfil de usuario (registro y visualización).

@Schema()
export class User {

  // Para hashear contraseñas.

  @Prop()
  salt: string;

  // Id para cada usuario.

  @Prop()
  _id?: string;

  // Nombre completo del usuario.

  @Prop({ required: true, maxlength: 100 })
  fullname: string;

  // Nombre de usuario único.

  @Prop({ required: true, unique: true, maxlength: 50 })
  username: string;

  // Correo electrónico único.

  @Prop({ required: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/})
  email: string;

  // Contraseña del usuario.

  @Prop({ required: true})
  password: string;

  // Foto de perfil del usuario.

  @Prop({ default: '' })
  profilePicture: string;

  // Lista de contactos del usuario.

  @Prop({ type: [String], default: [] })
  contacts: string[];

  // Número de partidas jugadas por el usuario.

  @Prop({ type: Number, default: 0 })
  gamesPlayed: number;

  // Número de partidas ganadas por el usuario.

  @Prop({ type: Number, default: 0 })
  gamesWon: number;

  // Número de partidas perdidas por el usuario.

  @Prop({ type: Number, default: 0 })
  gamesLost: number;

  // Fecha y hora de la última vez que el usuario estuvo conectado.

  @Prop({ default: null })
  lastSeen: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);

// Creación de índices para garantizar la unicidad de los valores de 'username' y 'email'

// El índice en 'username' se crea de manera ascendente.

UserSchema.index({ username: 1 }, { unique: true });

// El índice en 'email' también se crea de manera ascendente y único.

UserSchema.index({ email: 1 }, { unique: true });

